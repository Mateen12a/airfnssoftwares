import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "./MagneticButton";
import { apiUrl } from "@/lib/api";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const MESSAGE_MAX = 3000;

// RFC-pragmatic email pattern (anchored, single @, label dots, TLD)
function validateEmail(email: string): boolean {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim());
}

/** Strip angle brackets + control chars before they ever hit state. */
function sanitize(str: string): string {
  return str
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[<>]/g, "");
}

function fieldRules(form: FormData): FormErrors {
  const e: FormErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const subject = form.subject.trim();
  const message = form.message.trim();

  if (!name) e.name = "Please enter your name";
  else if (name.length < 2) e.name = "Name is too short";
  else if (!/^[\p{L}\p{N}\s'\-\.]+$/u.test(name))
    e.name = "Name contains characters we don't allow";

  if (!email) e.email = "Email is required";
  else if (!validateEmail(email)) e.email = "That doesn't look like a valid email";

  if (!subject) e.subject = "Add a short subject";
  else if (subject.length < 2) e.subject = "Subject is too short";

  if (!message) e.message = "Your message is empty";
  else if (message.length < 10) e.message = "Please write at least a few words";
  else if (message.length > MESSAGE_MAX) e.message = "Message is too long";

  return e;
}

export default function Contact() {
  const [form, setForm] = useState<FormData>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const [originalMessage, setOriginalMessage] = useState<string | null>(null);
  const [originalSubject, setOriginalSubject] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [showEnhanceOptions, setShowEnhanceOptions] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  // Timestamp of when the form first mounted — sent to server to detect bots.
  const mountedAt = useRef<number>(Date.now());

  // Warn the user before they leave if they have started filling the form.
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      const dirty =
        !submitted &&
        (form.name || form.email || form.subject || form.message.length > 0);
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [form, submitted]);

  // Re-validate as the user fixes errors after they've blurred a field.
  useEffect(() => {
    const all = fieldRules(form);
    const visible: FormErrors = {};
    (Object.keys(all) as (keyof FormErrors)[]).forEach((k) => {
      if (touched[k]) visible[k] = all[k];
    });
    setErrors(visible);
  }, [form, touched]);

  // Countdown for rate-limited retry.
  useEffect(() => {
    if (retryAfter === null) return;
    if (retryAfter <= 0) {
      setRetryAfter(null);
      return;
    }
    const t = setTimeout(() => setRetryAfter((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [retryAfter]);

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: sanitize(value) }));
  }

  function handleBlur(field: keyof FormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function touchAll() {
    setTouched({ name: true, email: true, subject: true, message: true });
  }

  /** Network helper with timeout + offline check. */
  async function postJson<T = unknown>(
    url: string,
    body: unknown,
    timeoutMs = 15000
  ): Promise<{ status: number; data: T | null; offline: boolean; timedOut: boolean }> {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { status: 0, data: null, offline: true, timedOut: false };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(apiUrl(url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      let data: T | null = null;
      try {
        data = (await res.json()) as T;
      } catch {
        data = null;
      }
      return { status: res.status, data, offline: false, timedOut: false };
    } catch (err) {
      const aborted = (err as Error)?.name === "AbortError";
      return { status: 0, data: null, offline: false, timedOut: aborted };
    } finally {
      clearTimeout(timer);
    }
  }

  async function handleEnhance() {
    if (form.message.trim().length < 10) {
      setEnhanceError("Write at least a few words first.");
      return;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setEnhanceError("You appear to be offline. Your message is ready to send when you're back.");
      return;
    }

    setEnhancing(true);
    setEnhanceError(null);
    setShowEnhanceOptions(false);

    const savedMessage = form.message;
    const savedSubject = form.subject;

    // Non-streaming fallback. Used if the streaming endpoint times out, fails,
    // or returns nothing — common on flaky mobile networks and after a cold
    // start on the backend's hosting platform.
    async function runFallback(): Promise<boolean> {
      const { status, data, offline, timedOut } = await postJson<{
        enhanced?: string;
        subject?: string;
        error?: string;
      }>("/api/ai-enhance", { message: savedMessage }, 60000);

      if (offline) {
        setEnhanceError("You appear to be offline. Your message is ready to send when you're back.");
        return false;
      }
      if (timedOut) {
        setEnhanceError("AI took too long to respond. Send your message as written.");
        return false;
      }
      if (status === 429 || status === 503) {
        setEnhanceError(data?.error ?? "AI is busy right now. Please send your message as written.");
        return false;
      }
      if (status >= 400 || !data?.enhanced) {
        setEnhanceError(data?.error ?? "AI enhancement could not run. Your message is ready to send as-is.");
        return false;
      }

      setOriginalMessage(savedMessage);
      setOriginalSubject(savedSubject);
      setForm((prev) => ({
        ...prev,
        message: data.enhanced!,
        subject: data.subject || prev.subject,
      }));
      if (data.subject) {
        setErrors((prev) => ({ ...prev, subject: undefined }));
        setTouched((prev) => ({ ...prev, subject: true }));
      }
      setShowEnhanceOptions(true);
      return true;
    }

    // Try streaming first — text appears as the AI generates it, so the user
    // sees progress instantly instead of waiting on a spinner. We give the
    // server up to 35s to send its first non-ping byte (covers cold starts on
    // the hosting platform plus slow mobile carriers) and 75s overall.
    const controller = new AbortController();
    const overallTimer = setTimeout(() => controller.abort(), 75000);

    let firstByteTimer: ReturnType<typeof setTimeout> | null = setTimeout(
      () => controller.abort(),
      35000
    );

    try {
      const res = await fetch(apiUrl("/api/ai-enhance/stream"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: savedMessage }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        // Server rejected before streaming started — try to parse JSON error.
        let errMsg = "Could not enhance right now. Your message is ready to send as-is.";
        try {
          const j = (await res.json()) as { error?: string };
          if (j?.error) errMsg = j.error;
        } catch {
          /* ignore */
        }
        if (res.status === 429) {
          setEnhanceError(errMsg);
        } else if (res.status === 503) {
          setEnhanceError(errMsg);
        } else {
          setEnhanceError(errMsg);
        }
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      // Wipe the current message so streamed text replaces it cleanly.
      let bodyStarted = false;
      let bodyText = "";
      let receivedSubject = "";
      let sawAny = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // The very first byte of any kind (including a "ping") proves the
        // server is alive and the network is flowing — clear the first-byte
        // timer immediately. We only flip the spinner off when real content
        // (subject/chunk) starts arriving.
        if (firstByteTimer) {
          clearTimeout(firstByteTimer);
          firstByteTimer = null;
        }

        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          let evt:
            | { type: "ping" }
            | { type: "subject"; data: string }
            | { type: "chunk"; data: string }
            | { type: "done" }
            | { type: "error"; error: string }
            | null = null;
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }
          if (!evt) continue;

          // Heartbeats only keep the connection alive; nothing user-visible.
          if (evt.type === "ping") continue;

          sawAny = true;
          // Hide the full-overlay spinner once real content starts flowing —
          // the textarea itself will show streaming progress.
          if (enhancing) setEnhancing(false);

          if (evt.type === "subject") {
            receivedSubject = evt.data;
            setForm((prev) => ({ ...prev, subject: evt!.data as string }));
            setErrors((prev) => ({ ...prev, subject: undefined }));
            setTouched((prev) => ({ ...prev, subject: true }));
          } else if (evt.type === "chunk") {
            if (!bodyStarted) {
              bodyText = evt.data;
              bodyStarted = true;
              setForm((prev) => ({ ...prev, message: bodyText }));
            } else {
              bodyText += evt.data;
              setForm((prev) => ({ ...prev, message: bodyText }));
            }
          } else if (evt.type === "error") {
            setEnhanceError(evt.error);
            // Restore the user's text — we don't want to leave a half-baked
            // body behind.
            setForm((prev) => ({
              ...prev,
              message: savedMessage,
              subject: savedSubject,
            }));
            return;
          } else if (evt.type === "done") {
            // graceful end
          }
        }
      }

      if (!sawAny || !bodyText.trim()) {
        // Stream produced no usable content. Quietly fall back to the
        // non-streaming endpoint before surfacing an error to the user.
        setForm((prev) => ({ ...prev, message: savedMessage, subject: savedSubject }));
        setEnhancing(true);
        await runFallback();
        return;
      }

      setOriginalMessage(savedMessage);
      setOriginalSubject(savedSubject);
      // Snap final subject in case it arrived after we cleared form.
      if (receivedSubject) {
        setForm((prev) => ({ ...prev, subject: receivedSubject }));
      }
      setShowEnhanceOptions(true);
    } catch (err) {
      // Streaming failed. Restore the user's text and try the non-streaming
      // endpoint as a silent fallback before showing any error message —
      // mobile networks and cold starts often kill the stream but a plain
      // POST will still complete.
      setForm((prev) => ({ ...prev, message: savedMessage, subject: savedSubject }));
      const aborted = (err as Error)?.name === "AbortError";
      setEnhancing(true);
      const ok = await runFallback();
      if (!ok && aborted) {
        // runFallback already set an error message; keep it.
      }
    } finally {
      clearTimeout(overallTimer);
      if (firstByteTimer) clearTimeout(firstByteTimer);
      setEnhancing(false);
    }
  }

  function useEnhanced() {
    setShowEnhanceOptions(false);
    setOriginalMessage(null);
    setOriginalSubject(null);
  }
  function regenEnhance() {
    if (originalMessage) setForm((prev) => ({
      ...prev,
      message: originalMessage,
      subject: originalSubject ?? prev.subject,
    }));
    setShowEnhanceOptions(false);
    setOriginalMessage(null);
    setOriginalSubject(null);
    setTimeout(() => handleEnhance(), 50);
  }
  function useOriginal() {
    if (originalMessage) setForm((prev) => ({
      ...prev,
      message: originalMessage,
      subject: originalSubject ?? prev.subject,
    }));
    setShowEnhanceOptions(false);
    setOriginalMessage(null);
    setOriginalSubject(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || retryAfter !== null) return;

    touchAll();
    const validation = fieldRules(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      // Focus first invalid field for accessibility.
      const first = (["name", "email", "subject", "message"] as (keyof FormData)[]).find(
        (k) => validation[k]
      );
      if (first) {
        const el = document.getElementById(`cf-${first}`);
        el?.focus();
      }
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      website: honeypotRef.current?.value ?? "",
      _t: mountedAt.current,
    };

    const { status, data, offline, timedOut } = await postJson<{
      success?: boolean;
      error?: string;
      details?: Record<string, string[]>;
    }>("/api/contact", payload, 20000);

    setSubmitting(false);

    if (offline) {
      setSubmitError("You appear to be offline. Reconnect and try again, or email hello@airfnssoftwares.com directly.");
      return;
    }
    if (timedOut) {
      setSubmitError("The request timed out. Please try again, or email hello@airfnssoftwares.com directly.");
      return;
    }
    if (status === 429) {
      // Express-rate-limit responses include either Retry-After or our message.
      setRetryAfter(60);
      setSubmitError(data?.error ?? "Too many attempts. Please try again shortly.");
      return;
    }
    if (status === 400 && data?.details) {
      // Map server field errors back onto the form.
      const serverErrors: FormErrors = {};
      for (const [k, msgs] of Object.entries(data.details)) {
        if (k in form && msgs?.[0]) (serverErrors as Record<string, string>)[k] = msgs[0];
      }
      setErrors((prev) => ({ ...prev, ...serverErrors }));
      setSubmitError(data.error ?? "Please check the highlighted fields.");
      return;
    }
    if (status === 503) {
      setSubmitError(data?.error ?? "Email service is temporarily unavailable. Please email hello@airfnssoftwares.com directly.");
      return;
    }
    if (status >= 400 || !data?.success) {
      setSubmitError(data?.error ?? "Something went wrong. Please email hello@airfnssoftwares.com directly.");
      return;
    }

    setSubmitted(true);
  }

  const charCount = form.message.length;
  const charCountColor =
    charCount > MESSAGE_MAX
      ? "text-[#E53E3E]"
      : charCount > MESSAGE_MAX * 0.9
        ? "text-[#FCA5A5]"
        : "text-[#6B7280]";

  const errorCount = Object.values(errors).filter(Boolean).length;
  const submitDisabled =
    submitting || showEnhanceOptions || retryAfter !== null;

  return (
    <section className="py-32 border-t border-[#1F1F1F]" id="contact">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:pt-4"
          >
            <p className="text-[#E53E3E] font-mono text-xs tracking-[0.2em] uppercase mb-6">Contact</p>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-none mb-6">
              Let's talk.
            </h2>
            <p className="text-[#9CA3AF] leading-relaxed mb-8">
              We are always open to the right conversations. Whether you have a project in mind, a problem to solve, or you simply want to understand what we do, reach out. We respond to every message.
            </p>

            <a
              href="mailto:hello@airfnssoftwares.com"
              className="inline-flex items-center gap-2 text-white font-medium hover:text-[#E53E3E] transition-colors duration-200 group"
              data-testid="contact-email-link"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="3" width="14" height="10" rx="1" />
                <path d="M1 4l7 5 7-5" />
              </svg>
              hello@airfnssoftwares.com
            </a>

            <div className="mt-12 pt-8 border-t border-[#1F1F1F]">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#E53E3E] flex-shrink-0" />
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  Our contact form uses AI to help you communicate clearly. You are always in control.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center min-h-[400px] text-center"
                  data-testid="contact-success"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-[#E53E3E] flex items-center justify-center mb-6">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 10l5 5 7-7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-2">Message received.</h3>
                  <p className="text-[#6B7280]">We will be in touch.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  data-testid="contact-form"
                  noValidate
                >
                  {/* Honeypot — hidden from real users, irresistible to bots. */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-10000px",
                      top: "auto",
                      width: 1,
                      height: 1,
                      overflow: "hidden",
                    }}
                  >
                    <label htmlFor="cf-website">Website (leave empty)</label>
                    <input
                      ref={honeypotRef}
                      id="cf-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      defaultValue=""
                    />
                  </div>

                  <div className={`float-field ${errors.name ? "has-error" : ""}`}>
                    <input
                      id="cf-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className="float-input"
                      placeholder=" "
                      maxLength={100}
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "cf-name-err" : undefined}
                      data-testid="input-name"
                    />
                    <label htmlFor="cf-name" className="float-label">Full Name</label>
                    <span className="float-bar" />
                    {errors.name && (
                      <p id="cf-name-err" className="mt-2 text-[#E53E3E] text-xs font-mono">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className={`float-field ${errors.email ? "has-error" : ""}`}>
                    <input
                      id="cf-email"
                      type="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className="float-input"
                      placeholder=" "
                      maxLength={254}
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "cf-email-err" : undefined}
                      data-testid="input-email"
                    />
                    <label htmlFor="cf-email" className="float-label">Email Address</label>
                    <span className="float-bar" />
                    {errors.email && (
                      <p id="cf-email-err" className="mt-2 text-[#E53E3E] text-xs font-mono">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className={`float-field ${errors.subject ? "has-error" : ""}`}>
                    <input
                      id="cf-subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      onBlur={() => handleBlur("subject")}
                      className="float-input"
                      placeholder=" "
                      maxLength={200}
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? "cf-subject-err" : undefined}
                      data-testid="input-subject"
                    />
                    <label htmlFor="cf-subject" className="float-label">Subject</label>
                    <span className="float-bar" />
                    {errors.subject && (
                      <p id="cf-subject-err" className="mt-2 text-[#E53E3E] text-xs font-mono">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className={`float-field relative ${errors.message ? "has-error" : ""}`}>
                      <AnimatePresence>
                        {enhancing && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0A0A0A]/85 z-10 flex items-center justify-center backdrop-blur-sm rounded-sm"
                          >
                            <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
                              <svg className="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#E53E3E" strokeWidth="2">
                                <path d="M8 2a6 6 0 016 6" strokeLinecap="round" />
                              </svg>
                              Enhancing...
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <textarea
                        id="cf-message"
                        ref={textareaRef}
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        onBlur={() => handleBlur("message")}
                        rows={5}
                        className="float-textarea"
                        placeholder=" "
                        maxLength={MESSAGE_MAX}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "cf-message-err" : "cf-message-counter"}
                        data-testid="input-message"
                      />
                      <label htmlFor="cf-message" className="float-label">Message</label>
                      <span className="float-bar" />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div className="min-h-[1rem]">
                        {errors.message && (
                          <p id="cf-message-err" className="text-[#E53E3E] text-xs font-mono">
                            {errors.message}
                          </p>
                        )}
                      </div>
                      <p
                        id="cf-message-counter"
                        className={`text-[10px] font-mono tabular-nums ${charCountColor}`}
                        aria-live="polite"
                      >
                        {charCount.toLocaleString()} / {MESSAGE_MAX.toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleEnhance}
                        disabled={enhancing || showEnhanceOptions}
                        className="inline-flex items-center gap-2 border border-[#E53E3E]/50 text-[#E53E3E] text-xs font-mono tracking-wider px-4 py-2 hover:border-[#E53E3E] hover:bg-[#E53E3E]/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid="btn-ai-enhance"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M6 1l1.2 3.6H11L8.1 6.8l1.2 3.6L6 8.2 2.7 10.4l1.2-3.6L1 4.6h3.8z" />
                        </svg>
                        Enhance with AI
                      </button>
                    </div>

                    {enhanceError && (
                      <p className="mt-2 text-[#FCA5A5]/90 text-xs font-mono" role="status">
                        {enhanceError}
                      </p>
                    )}

                    <AnimatePresence>
                      {showEnhanceOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 flex flex-wrap items-center gap-3"
                        >
                          <button
                            type="button"
                            onClick={useEnhanced}
                            className="bg-[#E53E3E] text-white text-xs font-medium px-4 py-2 hover:bg-[#C53030] transition-colors"
                            data-testid="btn-use-enhanced"
                          >
                            Use This
                          </button>
                          <button
                            type="button"
                            onClick={regenEnhance}
                            className="border border-[#E53E3E]/50 text-[#E53E3E] text-xs px-4 py-2 hover:border-[#E53E3E] hover:bg-[#E53E3E]/10 transition-all"
                            data-testid="btn-regenerate"
                          >
                            Regenerate
                          </button>
                          <button
                            type="button"
                            onClick={useOriginal}
                            className="text-[#6B7280] text-xs hover:text-[#9CA3AF] transition-colors"
                            data-testid="btn-use-original"
                          >
                            Use My Original
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {submitError && (
                    <div
                      className="border border-[#E53E3E]/30 bg-[#E53E3E]/5 px-4 py-3 text-[#FCA5A5] text-xs leading-relaxed"
                      role="alert"
                      data-testid="contact-submit-error"
                    >
                      {submitError}
                    </div>
                  )}

                  {errorCount > 0 && Object.values(touched).some(Boolean) && (
                    <p className="text-[#6B7280] text-[11px] font-mono" aria-live="polite">
                      {errorCount} field{errorCount === 1 ? "" : "s"} need attention before sending.
                    </p>
                  )}

                  <MagneticButton
                    type="submit"
                    variant="primary"
                    disabled={submitDisabled}
                    className="w-full py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    data-testid="btn-submit-contact"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <svg className="spinner" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2">
                          <path d="M7 2a5 5 0 015 5" strokeLinecap="round" />
                        </svg>
                        Sending...
                      </span>
                    ) : retryAfter !== null ? (
                      `Try again in ${retryAfter}s`
                    ) : (
                      "Send Message"
                    )}
                  </MagneticButton>

                  <p className="text-[#4A4A4A] text-[10px] font-mono tracking-wider text-center pt-2">
                    Protected by rate limits and content checks. We never share your details.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
