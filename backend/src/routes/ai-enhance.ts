import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const router = Router();

const enhanceSchema = z.object({
  message: z
    .string()
    .min(10, "Message too short to enhance")
    .max(3000, "Message too long")
    .trim(),
});

const SUBJECT_TAG = "[[SUBJECT]]";
const MESSAGE_TAG = "[[MESSAGE]]";

/**
 * Cheap heuristics that catch obviously abusive payloads without ever calling
 * the model. Saves cost and stops the AI being used as an open rewriter.
 */
function looksLikeAbuse(message: string): string | null {
  const urlMatches = message.match(/https?:\/\/|www\./gi) || [];
  if (urlMatches.length > 3) return "Too many links in message.";

  const upperRatio =
    message.replace(/[^A-Z]/g, "").length /
    Math.max(1, message.replace(/[^A-Za-z]/g, "").length);
  if (message.length > 60 && upperRatio > 0.6) {
    return "Message looks like spam (mostly capital letters).";
  }

  if (/(.)\1{15,}/.test(message)) {
    return "Message contains excessive repeated characters.";
  }

  return null;
}

function buildPrompt(message: string): string {
  return `You are a professional communication assistant. The user wants to contact AirFns Softwares Ltd, a UK-registered AI and technology company. Take their raw message and produce two things:

1. A concise, professional subject line (5 to 9 words, max 70 characters, plain text, no trailing punctuation, no quotes, no emojis).
2. A clearer, well-structured rewrite of the message itself. Keep the original intent and tone fully intact. Do not invent facts, names, dates, prices, commitments or contact details. Do not add em dashes. The message must NOT include the subject as a heading or label inside it.

Output format — exactly this, nothing else, no markdown, no preamble:

${SUBJECT_TAG}<subject line on one line>
${MESSAGE_TAG}
<rewritten message body on the lines that follow>

User message:
${message}`;
}

function cleanSubject(s: string): string {
  return s.replace(/^["'`\s]+|["'`\s.!?:;,-]+$/g, "").slice(0, 70);
}

/**
 * Streaming endpoint. Emits NDJSON events:
 *   {"type":"subject","data":"..."}      // once, when known
 *   {"type":"chunk","data":"..."}        // many, each is a piece of the body
 *   {"type":"done"}                      // success
 *   {"type":"error","error":"..."}       // failure
 *
 * Streaming makes the AI feel instant: the user sees text appear as it is
 * generated, instead of staring at a spinner for several seconds.
 */
router.post("/stream", async (req: Request, res: Response) => {
  const parsed = enhanceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { message } = parsed.data;

  const abuse = looksLikeAbuse(message);
  if (abuse) {
    res.status(400).json({ error: abuse });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    req.log.error("GEMINI_API_KEY not configured");
    res.status(503).json({
      error:
        "AI enhancement is temporarily unavailable. Your message can still be sent as written.",
    });
    return;
  }

  res.status(200);
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (obj: Record<string, unknown>) => {
    res.write(JSON.stringify(obj) + "\n");
  };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024,
      },
    });

    const result = await model.generateContentStream(buildPrompt(message));

    let buffer = "";
    let subjectSent = false;
    let bodyStarted = false;
    let bodyTotal = "";

    for await (const piece of result.stream) {
      const text = piece.text();
      if (!text) continue;
      buffer += text;

      // Once we have crossed the MESSAGE_TAG, everything after it (including
      // any newly arriving chunks) is body text and is streamed straight to
      // the client.
      if (!bodyStarted) {
        const mIdx = buffer.indexOf(MESSAGE_TAG);
        if (mIdx !== -1) {
          // Extract subject from before the MESSAGE_TAG.
          if (!subjectSent) {
            const head = buffer.slice(0, mIdx);
            const sIdx = head.indexOf(SUBJECT_TAG);
            const rawSubject =
              sIdx !== -1 ? head.slice(sIdx + SUBJECT_TAG.length) : head;
            const subject = cleanSubject(rawSubject.split("\n")[0] ?? "");
            if (subject) send({ type: "subject", data: subject });
            subjectSent = true;
          }
          // Anything after MESSAGE_TAG starts the body.
          let body = buffer.slice(mIdx + MESSAGE_TAG.length);
          // Trim a single leading newline if present, keep further newlines.
          if (body.startsWith("\n")) body = body.slice(1);
          if (body.length > 0) {
            send({ type: "chunk", data: body });
            bodyTotal += body;
          }
          buffer = "";
          bodyStarted = true;
        }
        // If we still haven't hit the MESSAGE_TAG, keep buffering.
      } else {
        // We're in body-streaming mode; just forward.
        send({ type: "chunk", data: text });
        bodyTotal += text;
      }
    }

    // Stream ended. If we never saw the MESSAGE_TAG, fall back to whatever we
    // buffered as the body and try to recover a subject.
    if (!bodyStarted) {
      const sIdx = buffer.indexOf(SUBJECT_TAG);
      let subject = "";
      let body = buffer;
      if (sIdx !== -1) {
        const after = buffer.slice(sIdx + SUBJECT_TAG.length);
        const nl = after.indexOf("\n");
        if (nl !== -1) {
          subject = cleanSubject(after.slice(0, nl));
          body = after.slice(nl + 1);
        } else {
          subject = cleanSubject(after);
          body = "";
        }
      }
      if (subject && !subjectSent) send({ type: "subject", data: subject });
      const trimmed = body.trim();
      if (trimmed) {
        send({ type: "chunk", data: trimmed });
        bodyTotal += trimmed;
      }
    }

    if (!bodyTotal.trim()) {
      send({
        type: "error",
        error: "AI returned an empty response. Please send your message as written.",
      });
      res.end();
      return;
    }

    send({ type: "done" });
    res.end();
    req.log.info("AI enhancement (stream) completed");
  } catch (err) {
    const status = (err as { status?: number })?.status;
    const msg = (err as { message?: string })?.message ?? "";
    req.log.error({ err }, "AI enhance stream error");

    let errorMsg =
      "AI enhancement could not run. Your message is ready to send as-is.";
    if (status === 429 || /quota|rate/i.test(msg)) {
      errorMsg =
        "AI enhancement is busy right now. Please send your message as written, or try again in a moment.";
    } else if (status === 401 || status === 403) {
      errorMsg =
        "AI enhancement is temporarily unavailable. Your message can still be sent as written.";
    }

    try {
      send({ type: "error", error: errorMsg });
      res.end();
    } catch {
      // If headers already sent and the socket is gone, nothing to do.
    }
  }
});

/**
 * Non-streaming fallback. Same contract as before so older clients keep
 * working: returns {enhanced, subject}.
 */
router.post("/", async (req: Request, res: Response) => {
  const parsed = enhanceSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { message } = parsed.data;

  const abuse = looksLikeAbuse(message);
  if (abuse) {
    res.status(400).json({ error: abuse });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    req.log.error("GEMINI_API_KEY not configured");
    res.status(503).json({
      error: "AI enhancement is temporarily unavailable. Your message can still be sent as written.",
    });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024,
      },
    });

    const result = await model.generateContent(buildPrompt(message));
    const raw = result.response.text();
    const sIdx = raw.indexOf(SUBJECT_TAG);
    const mIdx = raw.indexOf(MESSAGE_TAG);

    let enhancedSubject = "";
    let enhancedMessage = "";

    if (sIdx !== -1 && mIdx !== -1 && mIdx > sIdx) {
      enhancedSubject = cleanSubject(
        raw.slice(sIdx + SUBJECT_TAG.length, mIdx).split("\n")[0] ?? ""
      );
      enhancedMessage = raw.slice(mIdx + MESSAGE_TAG.length).trim();
    } else {
      enhancedMessage = raw.trim();
    }

    if (!enhancedMessage) {
      res.status(502).json({
        error: "AI returned an empty response. Please send your message as written.",
      });
      return;
    }

    req.log.info("AI enhancement completed");
    res.json({
      enhanced: enhancedMessage,
      subject: enhancedSubject || undefined,
    });
  } catch (err) {
    const status = (err as { status?: number })?.status;
    const message = (err as { message?: string })?.message ?? "";
    req.log.error({ err }, "AI enhance error");

    if (status === 429 || /quota|rate/i.test(message)) {
      res.status(429).json({
        error: "AI enhancement is busy right now. Please send your message as written, or try again in a moment.",
      });
      return;
    }
    if (status === 401 || status === 403) {
      res.status(503).json({
        error: "AI enhancement is temporarily unavailable. Your message can still be sent as written.",
      });
      return;
    }

    res.status(502).json({
      error: "AI enhancement could not run. Your message is ready to send as-is.",
    });
  }
});

export default router;
