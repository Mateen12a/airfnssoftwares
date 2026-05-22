import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl } from "@/lib/api";

const EXPIRY = new Date("2026-05-27T23:59:59Z");

type Step = "welcome" | "name" | "confirmed" | "duplicate" | "expired" | "loading";

function isExpired(): boolean {
  return new Date() > EXPIRY;
}

function buildICS(name: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AirFns Softwares//Daya Motives//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:daya-motives-2026-${Date.now()}@airfnssoftwares.com`,
    "DTSTART:20260531T210000",
    "DTEND:20260601T000000",
    "SUMMARY:Daya Motives",
    `DESCRIPTION:You're on the list ${name}! Daya Motives - presented by AirFns Softwares.\\n\\nRemember: bring your own 18+ drinks if you drink.`,
    "LOCATION:Daya Motives",
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-P2D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Daya Motives is in 2 days. Get ready!",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT13H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Daya Motives is tonight. See you there.",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function downloadICS(name: string): void {
  const content = buildICS(name);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "daya-motives.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(name: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Daya Motives",
    dates: "20260531T210000/20260601T000000",
    details: `You're on the list ${name}! Daya Motives, presented by AirFns Softwares.\n\nRemember: bring your own 18+ drinks if you drink.`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function CalendarButtons({ name }: { name: string }) {
  return (
    <div className="dm-cal-wrap">
      <p className="dm-cal-label">Save the date so you don't miss it</p>
      <div className="dm-cal-row">
        <a
          href={googleCalendarUrl(name)}
          target="_blank"
          rel="noopener noreferrer"
          className="dm-cal-btn dm-cal-btn--google"
        >
          <svg viewBox="0 0 24 24" className="dm-cal-icon" aria-hidden="true">
            <rect width="24" height="24" rx="5" fill="#4285F4" />
            <path d="M12 11.5v2h2.5c-.1.7-.8 2-2.5 2-1.5 0-2.7-1.2-2.7-2.7s1.2-2.7 2.7-2.7c.8 0 1.4.4 1.8.8l1.4-1.4C14.3 8.6 13.2 8 12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4c2.3 0 3.8-1.6 3.8-3.9 0-.3 0-.5-.1-.6H12z" fill="#fff" />
          </svg>
          Google Calendar
        </a>
        <button onClick={() => downloadICS(name)} className="dm-cal-btn dm-cal-btn--ics">
          <svg viewBox="0 0 24 24" fill="none" className="dm-cal-icon" aria-hidden="true">
            <rect width="24" height="24" rx="5" fill="#1C1C1E" />
            <path d="M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Apple / Outlook
        </button>
      </div>
      <p className="dm-cal-note">Reminders: 2 days before and on the morning of 31 May</p>
    </div>
  );
}

export default function DayaInvite() {
  const [step, setStep] = useState<Step>(isExpired() ? "expired" : "welcome");
  const [name, setName] = useState("");
  const [confirmedName, setConfirmedName] = useState("");
  const [duplicateName, setDuplicateName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "name") setTimeout(() => inputRef.current?.focus(), 300);
  }, [step]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setStep("loading");
    setError("");

    try {
      const res = await fetch(apiUrl("/api/daya/rsvp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();

      if (res.status === 201) {
        setConfirmedName(data.name);
        setStep("confirmed");
      } else if (res.status === 409) {
        setDuplicateName(data.name);
        setStep("duplicate");
      } else if (res.status === 410) {
        setStep("expired");
      } else {
        setError(data.message ?? "Something went wrong. Please try again.");
        setStep("name");
      }
    } catch {
      setError("Something went wrong on our end. Please try again in a moment.");
      setStep("name");
    }
  }

  return (
    <div className="dm-root">
      {/* Ambient background layers */}
      <div className="dm-bg-orb dm-bg-orb--top" />
      <div className="dm-bg-orb dm-bg-orb--bottom" />
      <div className="dm-bg-grid" />

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" className="dm-screen"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>

            <div className="dm-logo-wrap">
              <img src="/assets/airfns-logo.png" alt="AirFns Softwares" className="dm-logo" />
            </div>

            <div className="dm-hero">
              <span className="dm-presents-tag">presents</span>
              <h1 className="dm-title">Daya<br />Motives</h1>
              <p className="dm-tagline">A day worth showing up for.</p>
            </div>

            <div className="dm-invite-card">
              <p className="dm-invite-text">
                You have been personally invited.<br />
                Not everyone gets this link, but you did.
              </p>
              <div className="dm-date-row">
                <span className="dm-date-pill">31 May 2026</span>
                <span className="dm-dot" />
                <span className="dm-expiry-text">RSVP closes 27 May</span>
              </div>
            </div>

            <button className="dm-circle-btn" onClick={() => setStep("name")} aria-label="Claim your spot">
              <span className="dm-ring dm-ring--1" />
              <span className="dm-ring dm-ring--2" />
              <span className="dm-ring dm-ring--3" />
              <span className="dm-circle-inner">
                <span className="dm-circle-label">Claim<br />Your Spot</span>
              </span>
            </button>

            <p className="dm-scroll-hint">Tap to RSVP</p>
          </motion.div>
        )}

        {(step === "name" || step === "loading") && (
          <motion.div key="name" className="dm-screen"
            initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>

            <div className="dm-logo-wrap">
              <img src="/assets/airfns-logo.png" alt="AirFns Softwares" className="dm-logo" />
            </div>

            <div className="dm-name-hero">
              <span className="dm-step-tag">Step 1 of 1</span>
              <h2 className="dm-name-title">What should we call you?</h2>
              <p className="dm-name-sub">We will add you to the guest list right away.</p>
            </div>

            <form className="dm-form" onSubmit={handleSubmit} noValidate>
              <div className="dm-input-group">
                <input
                  ref={inputRef}
                  type="text"
                  className="dm-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  disabled={step === "loading"}
                  maxLength={100}
                  autoComplete="name"
                  spellCheck={false}
                />
                <div className="dm-input-glow" />
              </div>
              {error && (
                <motion.p className="dm-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                  {error}
                </motion.p>
              )}
              <button type="submit" className="dm-submit" disabled={!name.trim() || step === "loading"}>
                {step === "loading" ? <span className="dm-spinner" /> : "Secure My Spot"}
                {step !== "loading" && <span className="dm-arrow">→</span>}
              </button>
            </form>

            <button className="dm-back" onClick={() => { setStep("welcome"); setError(""); }}>
              Back
            </button>
          </motion.div>
        )}

        {step === "confirmed" && (
          <motion.div key="confirmed" className="dm-screen"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

            <div className="dm-logo-wrap">
              <img src="/assets/airfns-logo.png" alt="AirFns Softwares" className="dm-logo" />
            </div>

            <div className="dm-confirmed-glow" />

            <motion.div className="dm-check-badge"
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}>
              ✓
            </motion.div>

            <div className="dm-confirmed-text">
              <h2 className="dm-confirmed-title">
                You are in, {confirmedName.split(" ")[0]}!
              </h2>
              <p className="dm-confirmed-sub">
                Your spot at Daya Motives is confirmed.<br />
                We will see you on <strong>31 May 2026</strong>.
              </p>
            </div>

            <div className="dm-drinks-card">
              <span className="dm-drinks-emoji">🥂</span>
              <div>
                <p className="dm-drinks-title">Bring your own drinks</p>
                <p className="dm-drinks-body">
                  If you drink, feel free to bring your own 18+ drinks along. That way you are sorted and the night stays good for everyone.
                </p>
              </div>
            </div>

            <CalendarButtons name={confirmedName} />
          </motion.div>
        )}

        {step === "duplicate" && (
          <motion.div key="duplicate" className="dm-screen"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}>

            <div className="dm-logo-wrap">
              <img src="/assets/airfns-logo.png" alt="AirFns Softwares" className="dm-logo" />
            </div>

            <div className="dm-check-badge dm-check-badge--amber">✓</div>

            <div className="dm-confirmed-text">
              <h2 className="dm-confirmed-title">
                You are already on the list{duplicateName ? `, ${duplicateName.split(" ")[0]}` : ""}!
              </h2>
              <p className="dm-confirmed-sub">
                You already secured your spot.<br />
                See you on <strong>31 May 2026</strong>.
              </p>
            </div>

            <div className="dm-drinks-card">
              <span className="dm-drinks-emoji">🥂</span>
              <div>
                <p className="dm-drinks-title">Bring your own drinks</p>
                <p className="dm-drinks-body">
                  If you drink, feel free to bring your own 18+ drinks along.
                </p>
              </div>
            </div>

            <CalendarButtons name={duplicateName} />
          </motion.div>
        )}

        {step === "expired" && (
          <motion.div key="expired" className="dm-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

            <div className="dm-logo-wrap">
              <img src="/assets/airfns-logo.png" alt="AirFns Softwares" className="dm-logo" />
            </div>

            <div className="dm-expired-icon">🕐</div>
            <h2 className="dm-expired-title">RSVP Closed</h2>
            <p className="dm-expired-sub">
              The invite link for Daya Motives has expired.<br />
              RSVPs closed on <strong>27 May 2026</strong>.
            </p>
            <p className="dm-expired-footer">Reach out to your host directly if you have questions.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dm-root {
          min-height: 100dvh;
          background: #07070E;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 5vw, 48px) clamp(16px, 5vw, 32px);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Ambient glows */
        .dm-bg-orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
        }
        .dm-bg-orb--top {
          width: clamp(300px, 60vw, 600px);
          height: clamp(200px, 40vw, 400px);
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%);
        }
        .dm-bg-orb--bottom {
          width: clamp(200px, 50vw, 500px);
          height: clamp(150px, 35vw, 350px);
          bottom: -60px;
          right: -80px;
          background: radial-gradient(ellipse, rgba(239,68,68,0.08) 0%, transparent 70%);
        }
        .dm-bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%);
        }

        /* Screen layout */
        .dm-screen {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
          position: relative;
          z-index: 1;
        }

        /* Logo */
        .dm-logo-wrap {
          margin-bottom: clamp(32px, 6vw, 52px);
        }
        .dm-logo {
          height: clamp(30px, 5vw, 40px);
          width: auto;
          opacity: 0.85;
          filter: brightness(1.1);
        }

        /* Hero text */
        .dm-hero { width: 100%; margin-bottom: clamp(24px, 4vw, 36px); }
        .dm-presents-tag {
          display: inline-block;
          font-size: clamp(10px, 2.5vw, 12px);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #F59E0B;
          font-weight: 600;
          margin-bottom: clamp(10px, 2vw, 16px);
        }
        .dm-title {
          font-size: clamp(64px, 18vw, 96px);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 0.92;
          background: linear-gradient(145deg, #FFFFFF 0%, #F9E9C4 45%, #F59E0B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: clamp(12px, 2.5vw, 20px);
        }
        .dm-tagline {
          font-size: clamp(14px, 3.5vw, 17px);
          color: #6B7280;
          font-style: italic;
          letter-spacing: 0.01em;
        }

        /* Invite card */
        .dm-invite-card {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: clamp(18px, 4vw, 28px) clamp(20px, 5vw, 32px);
          margin-bottom: clamp(36px, 6vw, 52px);
          backdrop-filter: blur(8px);
        }
        .dm-invite-text {
          font-size: clamp(14px, 3.5vw, 16px);
          color: #D1D5DB;
          line-height: 1.75;
          margin-bottom: clamp(14px, 3vw, 20px);
        }
        .dm-date-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .dm-date-pill {
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.3);
          color: #F59E0B;
          font-size: clamp(11px, 2.5vw, 13px);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 100px;
        }
        .dm-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #374151;
        }
        .dm-expiry-text {
          font-size: clamp(10px, 2.5vw, 12px);
          color: #4B5563;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        /* Circle CTA button */
        .dm-circle-btn {
          position: relative;
          width: clamp(140px, 36vw, 168px);
          height: clamp(140px, 36vw, 168px);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: clamp(16px, 3vw, 24px);
          background: transparent;
          padding: 0;
        }
        .dm-circle-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(145deg, #F59E0B 0%, #EF4444 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 0 1px rgba(245,158,11,0.4),
            0 8px 32px rgba(245,158,11,0.35),
            0 24px 60px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .dm-circle-btn:hover .dm-circle-inner {
          transform: scale(1.05);
          box-shadow:
            0 0 0 1px rgba(245,158,11,0.5),
            0 12px 48px rgba(245,158,11,0.5),
            0 28px 64px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .dm-circle-btn:active .dm-circle-inner { transform: scale(0.97); }
        .dm-circle-label {
          font-size: clamp(13px, 3vw, 15px);
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1.3;
        }
        .dm-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(245,158,11,0.35);
          animation: dm-ring-pulse 3s ease-out infinite;
          pointer-events: none;
        }
        .dm-ring--1 { animation-delay: 0s; }
        .dm-ring--2 { inset: -14px; border-color: rgba(245,158,11,0.2); animation-delay: 1s; }
        .dm-ring--3 { inset: -28px; border-color: rgba(245,158,11,0.1); animation-delay: 2s; }
        @keyframes dm-ring-pulse {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.15); }
        }
        .dm-scroll-hint {
          font-size: clamp(10px, 2.5vw, 12px);
          color: #374151;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Name step */
        .dm-name-hero { width: 100%; margin-bottom: clamp(28px, 5vw, 40px); }
        .dm-step-tag {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4B5563;
          margin-bottom: 14px;
        }
        .dm-name-title {
          font-size: clamp(28px, 8vw, 42px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #FFFFFF;
          margin-bottom: 10px;
          line-height: 1.1;
        }
        .dm-name-sub {
          font-size: clamp(13px, 3.5vw, 15px);
          color: #6B7280;
        }

        /* Form */
        .dm-form { width: 100%; display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
        .dm-input-group { position: relative; width: 100%; }
        .dm-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: clamp(16px, 4vw, 20px) clamp(18px, 4vw, 22px);
          font-size: clamp(16px, 4vw, 18px);
          color: #FFFFFF;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        .dm-input::placeholder { color: #374151; }
        .dm-input:focus {
          border-color: rgba(245,158,11,0.55);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
        }
        .dm-input:disabled { opacity: 0.45; }
        .dm-error {
          font-size: 13px;
          color: #F87171;
          text-align: left;
          padding: 0 4px;
        }
        .dm-submit {
          width: 100%;
          background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
          border: none;
          border-radius: 16px;
          padding: clamp(16px, 4vw, 20px);
          font-size: clamp(14px, 3.5vw, 16px);
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 58px;
          box-shadow: 0 4px 24px rgba(245,158,11,0.3);
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.2s;
        }
        .dm-submit:not(:disabled):hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(245,158,11,0.4);
        }
        .dm-submit:disabled { opacity: 0.35; cursor: not-allowed; }
        .dm-arrow { font-size: 18px; }
        .dm-spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: dm-spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes dm-spin { to { transform: rotate(360deg); } }
        .dm-back {
          background: none; border: none;
          color: #4B5563; font-size: 13px;
          cursor: pointer; padding: 8px 12px;
          letter-spacing: 0.04em;
          transition: color 0.2s;
          border-radius: 8px;
        }
        .dm-back:hover { color: #9CA3AF; }

        /* Confirmed / duplicate */
        .dm-confirmed-glow {
          position: absolute;
          top: 60px; left: 50%;
          transform: translateX(-50%);
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .dm-check-badge {
          width: clamp(56px, 14vw, 72px);
          height: clamp(56px, 14vw, 72px);
          border-radius: 50%;
          background: linear-gradient(145deg, #F59E0B, #EF4444);
          display: flex; align-items: center; justify-content: center;
          font-size: clamp(22px, 6vw, 30px);
          color: #fff; font-weight: 700;
          margin-bottom: clamp(18px, 4vw, 28px);
          box-shadow: 0 0 0 8px rgba(245,158,11,0.08), 0 8px 32px rgba(245,158,11,0.35);
          position: relative; z-index: 1;
        }
        .dm-check-badge--amber {
          background: linear-gradient(145deg, #D97706, #F59E0B);
        }
        .dm-confirmed-text { width: 100%; margin-bottom: clamp(20px, 4vw, 32px); position: relative; z-index: 1; }
        .dm-confirmed-title {
          font-size: clamp(26px, 7vw, 38px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #FFFFFF;
          margin-bottom: 12px;
          line-height: 1.15;
        }
        .dm-confirmed-sub {
          font-size: clamp(13px, 3.5vw, 15px);
          color: #9CA3AF;
          line-height: 1.75;
        }
        .dm-confirmed-sub strong { color: #F9FAFB; font-weight: 600; }

        /* Drinks card */
        .dm-drinks-card {
          width: 100%;
          background: rgba(245,158,11,0.06);
          border: 1px solid rgba(245,158,11,0.18);
          border-radius: 16px;
          padding: clamp(16px, 4vw, 22px) clamp(18px, 4vw, 24px);
          display: flex;
          align-items: flex-start;
          gap: 14px;
          text-align: left;
          margin-bottom: clamp(20px, 4vw, 32px);
        }
        .dm-drinks-emoji { font-size: clamp(20px, 5vw, 24px); flex-shrink: 0; margin-top: 1px; }
        .dm-drinks-title {
          font-size: clamp(11px, 2.5vw, 12px);
          font-weight: 700;
          color: #F59E0B;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .dm-drinks-body {
          font-size: clamp(12px, 3vw, 14px);
          color: #9CA3AF;
          line-height: 1.65;
        }

        /* Calendar */
        .dm-cal-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .dm-cal-label {
          font-size: clamp(11px, 2.5vw, 12px);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #4B5563;
        }
        .dm-cal-row { width: 100%; display: flex; gap: 10px; }
        .dm-cal-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: clamp(12px, 3vw, 15px) 14px;
          border-radius: 12px;
          font-size: clamp(12px, 3vw, 13px);
          font-weight: 600;
          cursor: pointer;
          border: none;
          text-decoration: none;
          color: #fff;
          letter-spacing: 0.02em;
          transition: opacity 0.18s, transform 0.15s;
        }
        .dm-cal-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .dm-cal-btn--google { background: #1A73E8; }
        .dm-cal-btn--ics { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); }
        .dm-cal-icon { width: 20px; height: 20px; flex-shrink: 0; }
        .dm-cal-note { font-size: clamp(10px, 2.5vw, 12px); color: #374151; }

        /* Expired */
        .dm-expired-icon { font-size: clamp(40px, 10vw, 56px); margin-bottom: 20px; }
        .dm-expired-title {
          font-size: clamp(28px, 7vw, 40px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }
        .dm-expired-sub {
          font-size: clamp(13px, 3.5vw, 15px);
          color: #9CA3AF;
          line-height: 1.75;
          margin-bottom: 24px;
        }
        .dm-expired-sub strong { color: #F9FAFB; font-weight: 600; }
        .dm-expired-footer { font-size: 13px; color: #4B5563; }

        /* Tablet / desktop spacers */
        @media (min-width: 640px) {
          .dm-screen { gap: 4px; }
          .dm-invite-card { padding: 28px 36px; }
        }
        @media (min-width: 1024px) {
          .dm-root { padding: 60px 40px; }
        }
      `}</style>
    </div>
  );
}
