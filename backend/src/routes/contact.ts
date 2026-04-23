import { Router, Request, Response } from "express";
import { Resend } from "resend";
import { z } from "zod";
import { createHash } from "crypto";

const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Schema for the public contact form.
 *
 * - `website` is a HONEYPOT. The frontend renders it hidden (offscreen, aria-hidden,
 *   tabindex -1, autocomplete=off). Real users never touch it; bots that auto-fill
 *   form fields will. If filled, we silently 200 so the bot believes it succeeded.
 * - `_t` is the millisecond timestamp recorded when the form first mounted. If the
 *   form is submitted in under ~3 seconds, it's almost certainly a bot.
 */
const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .trim()
    .regex(/^[\p{L}\p{N}\s'\-\.]+$/u, "Name contains invalid characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email too long")
    .trim()
    .toLowerCase(),
  subject: z
    .string()
    .min(2, "Subject is required")
    .max(200, "Subject too long")
    .trim(),
  message: z
    .string()
    .min(10, "Please write at least a few words")
    .max(5000, "Message too long")
    .trim(),
  website: z.string().max(200).optional().default(""),
  _t: z.number().optional(),
});

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Strip ASCII control chars that have no business in a contact form. */
const stripControl = (s: string) =>
  // eslint-disable-next-line no-control-regex
  s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

/**
 * Lightweight spam score. Returns a reason string if the submission looks
 * automated/abusive, otherwise null.
 */
function spamReason(name: string, subject: string, message: string): string | null {
  const text = `${subject}\n${message}`;
  const urls = (text.match(/https?:\/\/|www\./gi) || []).length;
  if (urls > 4) return "too many links";

  const upperLetters = text.replace(/[^A-Z]/g, "").length;
  const totalLetters = text.replace(/[^A-Za-z]/g, "").length;
  if (totalLetters > 60 && upperLetters / totalLetters > 0.65) {
    return "shouting";
  }

  if (/(.)\1{20,}/.test(text)) return "character flood";

  // Gibberish name (e.g. "asdfasdf", "qwerty")
  if (/^([a-z])\1{4,}/i.test(name) || /^(asdf|qwer|test123|admin)$/i.test(name)) {
    return "suspicious name";
  }

  // Common spam vocabulary in subject (very narrow whitelist of red flags)
  if (/\b(viagra|seo services|cheap loan|crypto investment|казино|बिटकॉइन)\b/i.test(text)) {
    return "spam vocabulary";
  }

  return null;
}

/**
 * In-memory dedupe cache: same (email + message hash) within 10 minutes is
 * treated as a duplicate and silently ack'd. Survives single-instance only,
 * which is fine for an API of this scale.
 */
const recent = new Map<string, number>();
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;
function isDuplicate(email: string, message: string): boolean {
  const key = createHash("sha256").update(`${email}|${message}`).digest("hex");
  const now = Date.now();
  // Opportunistic cleanup
  if (recent.size > 500) {
    for (const [k, t] of recent) if (now - t > DEDUPE_WINDOW_MS) recent.delete(k);
  }
  const last = recent.get(key);
  if (last && now - last < DEDUPE_WINDOW_MS) return true;
  recent.set(key, now);
  return false;
}

router.post("/", async (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Please check the fields below.",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { website, _t } = parsed.data;
  const name = stripControl(parsed.data.name);
  const email = parsed.data.email;
  const subject = stripControl(parsed.data.subject);
  const message = stripControl(parsed.data.message);

  // Honeypot tripped: pretend success, log silently. Don't tip off the bot.
  if (website && website.length > 0) {
    req.log.warn({ ip: req.ip }, "Contact honeypot tripped");
    res.json({ success: true });
    return;
  }

  // Submission too fast → likely a bot.
  if (typeof _t === "number" && Number.isFinite(_t)) {
    const elapsed = Date.now() - _t;
    if (elapsed < 3000) {
      req.log.warn({ ip: req.ip, elapsed }, "Contact submitted too quickly");
      res.json({ success: true });
      return;
    }
  }

  const spam = spamReason(name, subject, message);
  if (spam) {
    req.log.warn({ ip: req.ip, spam }, "Contact flagged as spam");
    // Same trick: ack so we don't help spammers tune.
    res.json({ success: true });
    return;
  }

  if (isDuplicate(email, message)) {
    req.log.info({ email }, "Contact duplicate suppressed");
    res.json({ success: true });
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "hello@airfnssoftwares.com";

  if (!process.env.RESEND_API_KEY) {
    req.log.error("RESEND_API_KEY not configured");
    res.status(503).json({
      error: "Email service is temporarily unavailable. Please email hello@airfnssoftwares.com directly.",
    });
    return;
  }

  try {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const { error } = await resend.emails.send({
      from: `AirFns Softwares <${fromEmail}>`,
      to: [fromEmail],
      replyTo: email,
      subject: `[Contact] ${subject}`.slice(0, 240),
      html: `
        <div style="font-family: Inter, sans-serif; background: #0A0A0A; color: #F9FAFB; padding: 32px; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #1F1F1F;">
          <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #1F1F1F;">
            <h2 style="margin: 0; color: #E53E3E; font-size: 18px; font-weight: 700;">New Contact Message</h2>
            <p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">AirFns Softwares Ltd</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px; width: 80px;">From</td><td style="padding: 8px 0; color: #F9FAFB;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #E53E3E;">${safeEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Subject</td><td style="padding: 8px 0; color: #F9FAFB;">${safeSubject}</td></tr>
          </table>
          <div style="background: #111111; border: 1px solid #1F1F1F; border-radius: 6px; padding: 20px;">
            <p style="margin: 0; color: #9CA3AF; font-size: 13px; margin-bottom: 8px;">Message</p>
            <p style="margin: 0; color: #F9FAFB; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>
      `,
      text: `New contact message\n\nFrom: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    });

    if (error) {
      req.log.error({ error }, "Resend error");
      res.status(502).json({
        error: "We could not send your message right now. Please email hello@airfnssoftwares.com directly.",
      });
      return;
    }

    req.log.info({ name, email }, "Contact email sent");
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Contact route error");
    res.status(500).json({
      error: "Something went wrong on our side. Please email hello@airfnssoftwares.com directly.",
    });
  }
});

export default router;
