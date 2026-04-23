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

  // Repeated character runs (e.g. "aaaaaaa", "!!!!!!!!!!")
  if (/(.)\1{15,}/.test(message)) {
    return "Message contains excessive repeated characters.";
  }

  return null;
}

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
    // gemini-flash-latest always points at the current fast Flash model so we
    // don't have to chase model rename retirements.
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    const systemPrompt = `You are a professional communication assistant. The user wants to contact AirFns Softwares Ltd, a UK-registered AI and technology company. Take their raw message and produce two things:

1. "subject": a concise, professional subject line that captures the core ask (5 to 9 words, max 70 characters, plain text, no trailing punctuation, no quotes, no emojis).
2. "message": a clearer, well-structured rewrite of the message itself. Keep the original intent and tone fully intact. Do not invent facts, names, dates, prices, commitments, or contact details. Do not add em dashes. The message must NOT include the subject as a heading or label inside it.

Return strictly valid JSON of the shape: {"subject": "...", "message": "..."}. No preamble, no explanation, no markdown fences.`;

    const result = await model.generateContent(
      `${systemPrompt}\n\nUser message:\n${message}`
    );

    const raw = result.response.text().trim();
    let parsedOut: { subject?: unknown; message?: unknown } | null = null;
    try {
      parsedOut = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsedOut = JSON.parse(m[0]);
        } catch {
          parsedOut = null;
        }
      }
    }

    const enhancedMessage =
      typeof parsedOut?.message === "string" ? parsedOut.message.trim() : "";
    let enhancedSubject =
      typeof parsedOut?.subject === "string" ? parsedOut.subject.trim() : "";

    enhancedSubject = enhancedSubject
      .replace(/^["'`\s]+|["'`\s.!?:;,-]+$/g, "")
      .slice(0, 70);

    if (!enhancedMessage) {
      res.status(502).json({
        error: "AI returned an empty response. Please send your message as written.",
      });
      return;
    }

    req.log.info("AI enhancement completed");
    res.json({ enhanced: enhancedMessage, subject: enhancedSubject || undefined });
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
