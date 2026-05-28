import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl } from "@/lib/api";

const EXPIRY = new Date("2026-05-27T23:59:59Z");
const EVENT_DATE = new Date("2026-05-31T15:00:00Z");

type Step =
  | "welcome"
  | "name"
  | "confirmed"
  | "duplicate"
  | "expired"
  | "loading";

function isExpired(): boolean {
  return new Date() > EXPIRY;
}

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=36+Abiodun+Ogunleye+Solomade+Estate+Ikorodu+Lagos";

function getTimeLeft() {
  const now = new Date();
  const diff = EVENT_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function buildICS(name: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AirFns Softwares//Daya's Motive//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:daya-motive-2026-${Date.now()}@airfnssoftwares.com`,
    "DTSTART:20260531T160000",
    "DTEND:20260531T200000",
    "SUMMARY:Daya's Motive",
    `DESCRIPTION:You're on the list ${name}! Daya's Motive - presented by AirFns Softwares.\\n\\n4 PM to 8 PM · 36 Abiodun Ogunleye\\, Solomade Estate\\, Ikorodu\\, Lagos`,
    "LOCATION:36 Abiodun Ogunleye, Solomade Estate, Ikorodu, Lagos",
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-P2D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Daya's Motive is in 2 days. Get ready!",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT5H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Daya's Motive is today at 4 PM. See you there.",
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
  a.download = "dayas-motive.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(name: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Daya's Motive",
    dates: "20260531T160000/20260531T200000",
    details: `You're on the list ${name}! Daya's Motive, presented by AirFns Softwares.\n\n4 PM to 8 PM · 36 Abiodun Ogunleye, Solomade Estate, Ikorodu, Lagos`,
    location: "36 Abiodun Ogunleye, Solomade Estate, Ikorodu, Lagos",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function AirFnsLogo() {
  return (
    <a href="/" className="dm-logo-link" aria-label="AirFns Softwares">
      <img
        src="/assets/airfns-logo.png"
        alt="AirFns Softwares"
        className="dm-logo"
      />
    </a>
  );
}

function CalendarButtons({ name }: { name: string }) {
  return (
    <div className="dm-cal-wrap">
      <p className="dm-cal-label">SAVE THE DATE to your calendar</p>
      <div className="dm-cal-row">
        <button
          onClick={() => downloadICS(name)}
          className="dm-cal-btn dm-cal-btn--ics"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="dm-cal-icon"
            aria-hidden="true"
          >
            <rect width="24" height="24" rx="5" fill="#1C1C1E" />
            <path
              d="M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Apple Calendar
        </button>
        <a
          href={googleCalendarUrl(name)}
          target="_blank"
          rel="noopener noreferrer"
          className="dm-cal-btn dm-cal-btn--google"
        >
          <svg viewBox="0 0 24 24" className="dm-cal-icon" aria-hidden="true">
            <rect width="24" height="24" rx="5" fill="#4285F4" />
            <path
              d="M12 11.5v2h2.5c-.1.7-.8 2-2.5 2-1.5 0-2.7-1.2-2.7-2.7s1.2-2.7 2.7-2.7c.8 0 1.4.4 1.8.8l1.4-1.4C14.3 8.6 13.2 8 12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4c2.3 0 3.8-1.6 3.8-3.9 0-.3 0-.5-.1-.6H12z"
              fill="#fff"
            />
          </svg>
          Google
        </a>
      </div>
    </div>
  );
}

function AddressBlock() {
  return (
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="dm-address-card"
    >
      <span className="dm-address-icon">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </span>
      <div className="dm-address-text">
        <span className="dm-address-line">
          36, Abiodun Ogunleye, Solomade Estate
        </span>
        <span className="dm-address-sub">Ikorodu, Lagos · Open in Maps</span>
      </div>
      <span className="dm-address-arrow">↗</span>
    </a>
  );
}

export default function DayaInvite() {
  const [step, setStep] = useState<Step>(isExpired() ? "expired" : "welcome");
  const [name, setName] = useState("");
  const [confirmedName, setConfirmedName] = useState("");
  const [duplicateName, setDuplicateName] = useState("");
  const [error, setError] = useState("");
  const [mediaConsent, setMediaConsent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === "name") setTimeout(() => inputRef.current?.focus(), 350);
  }, [step]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !mediaConsent) return;
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
      setError(
        "Something went wrong on our end. Please try again in a moment.",
      );
      setStep("name");
    }
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="dm-root">
      <div className="dm-bg-orb dm-bg-orb--top" />
      <div className="dm-bg-orb dm-bg-orb--bottom" />
      <div className="dm-bg-orb dm-bg-orb--left" />
      <div className="dm-bg-grid" />
      <div className="dm-confetti" aria-hidden="true">
        <span className="dm-c dm-c--1" />
        <span className="dm-c dm-c--2" />
        <span className="dm-c dm-c--3" />
        <span className="dm-c dm-c--4" />
        <span className="dm-c dm-c--5" />
        <span className="dm-c dm-c--6" />
        <span className="dm-c dm-c--7" />
        <span className="dm-c dm-c--8" />
        <span className="dm-c dm-c--9" />
        <span className="dm-c dm-c--10" />
        <span className="dm-c dm-c--11" />
        <span className="dm-c dm-c--12" />
      </div>

      <AnimatePresence mode="wait">
        {/* ── WELCOME ── */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            className="dm-screen"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="dm-logo-wrap">
              <AirFnsLogo />
            </div>

            <div className="dm-hero">
              <span className="dm-presents-tag">presents</span>
              <div className="dm-title-wrap">
                <h1 className="dm-title">
                  Daya's
                  <br />
                  Motive
                </h1>
                <span className="dm-sparkle dm-sparkle--1">✦</span>
                <span className="dm-sparkle dm-sparkle--2">✦</span>
                <span className="dm-sparkle dm-sparkle--3">✦</span>
                <span className="dm-sparkle dm-sparkle--4">✦</span>
                <span className="dm-sparkle dm-sparkle--5">✦</span>
                <span className="dm-sparkle dm-sparkle--6">✦</span>
              </div>
              <div className="dm-party-tags">
                <span>🎉</span>
                <span>🥂</span>
                <span>✨</span>
              </div>
            </div>

            <div className="dm-invite-card">
              <div className="dm-date-row">
                <span className="dm-date-pill">31st of May 2026</span>
                <span className="dm-dot" />
                <span className="dm-time-pill">4 PM – 8 PM</span>
              </div>
              <div className="dm-expiry-row">
                <span className="dm-expiry-text">RSVP closes 27 May</span>
              </div>
            </div>

            <div className="dm-countdown">
              {[
                { value: timeLeft.days, label: "days" },
                { value: timeLeft.hours, label: "hrs" },
                { value: timeLeft.minutes, label: "min" },
                { value: timeLeft.seconds, label: "sec" },
              ].map(({ value, label }) => (
                <div className="dm-cd-unit" key={label}>
                  <span className="dm-cd-num">{pad(value)}</span>
                  <span className="dm-cd-label">{label}</span>
                </div>
              ))}
            </div>

            <button
              className="dm-circle-btn"
              onClick={() => setStep("name")}
              aria-label="Claim your spot"
            >
              <span className="dm-ring dm-ring--1" />
              <span className="dm-ring dm-ring--2" />
              <span className="dm-ring dm-ring--3" />
              <span className="dm-circle-inner">
                <span className="dm-circle-label">
                  Claim
                  <br />
                  Your Spot
                </span>
              </span>
            </button>

            <p className="dm-scroll-hint">Tap to RSVP</p>
          </motion.div>
        )}

        {/* ── NAME / LOADING ── */}
        {(step === "name" || step === "loading") && (
          <motion.div
            key="name"
            className="dm-screen"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="dm-logo-wrap">
              <AirFnsLogo />
            </div>

            <div className="dm-name-hero">
              <div className="dm-name-visual">
                <div className="dm-name-orb" />
                <div className="dm-name-star-wrap">
                  <svg
                    className="dm-name-star"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M32 4 L35.5 28.5 L60 32 L35.5 35.5 L32 60 L28.5 35.5 L4 32 L28.5 28.5 Z"
                      fill="url(#starGrad)"
                    />
                    <path
                      d="M32 14 L33.8 30.2 L50 32 L33.8 33.8 L32 50 L30.2 33.8 L14 32 L30.2 30.2 Z"
                      fill="url(#starGradInner)"
                      opacity="0.5"
                    />
                    <defs>
                      <radialGradient id="starGrad" cx="50%" cy="30%" r="60%">
                        <stop offset="0%" stopColor="#FFFBEB" />
                        <stop offset="50%" stopColor="#F9E9C4" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </radialGradient>
                      <radialGradient
                        id="starGradInner"
                        cx="50%"
                        cy="40%"
                        r="60%"
                      >
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#FCD34D" />
                      </radialGradient>
                    </defs>
                  </svg>
                  <span className="dm-name-micro-1">✦</span>
                  <span className="dm-name-micro-2">✦</span>
                </div>
                <div className="dm-name-lines">
                  <span className="dm-name-line-l" />
                  <span className="dm-name-line-r" />
                </div>
              </div>
              <h2 className="dm-name-title">
                What should we
                <br />
                call you?
              </h2>
              <p className="dm-name-sub">
                We'll add you to the guest list right away.
              </p>
            </div>

            <form className="dm-form" onSubmit={handleSubmit} noValidate>
              <div className="dm-input-group">
                <input
                  ref={inputRef}
                  type="text"
                  className="dm-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  disabled={step === "loading"}
                  maxLength={100}
                  autoComplete="name"
                  spellCheck={false}
                />
              </div>

              <label
                className={`dm-consent-label${mediaConsent ? " dm-consent-label--checked" : ""}`}
              >
                <span className="dm-consent-box">
                  <input
                    type="checkbox"
                    className="dm-consent-check"
                    checked={mediaConsent}
                    onChange={(e) => setMediaConsent(e.target.checked)}
                    disabled={step === "loading"}
                  />
                  <span className="dm-consent-tick" aria-hidden="true">
                    {mediaConsent && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path
                          d="M1 4L4 7.5L10 1"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="dm-consent-text">
                  I consent to photos and videos being taken at the event. It's
                  going to be a good time.
                </span>
              </label>

              {error && (
                <motion.p
                  className="dm-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                className="dm-submit"
                disabled={!name.trim() || !mediaConsent || step === "loading"}
              >
                {step === "loading" ? (
                  <span className="dm-spinner" />
                ) : (
                  "Secure My Spot"
                )}
                {step !== "loading" && <span className="dm-arrow">→</span>}
              </button>
            </form>

            <button
              className="dm-back"
              onClick={() => {
                setStep("welcome");
                setError("");
                setMediaConsent(false);
              }}
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* ── CONFIRMED ── */}
        {step === "confirmed" && (
          <motion.div
            key="confirmed"
            className="dm-screen"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="dm-confirmed-glow" />

            <motion.div
              className="dm-check-badge"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 280,
                damping: 18,
              }}
            >
              ✓
            </motion.div>

            <motion.div
              className="dm-confirmed-text"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
            >
              <h2 className="dm-confirmed-title">
                You're in, {confirmedName.split(" ")[0]}! 🎉
              </h2>
              <p className="dm-confirmed-sub">
                Your spot at Daya's Motive is confirmed.
                <br />
                We cannot wait to see you on <strong>31st of May</strong>.
              </p>
            </motion.div>

            <motion.div
              style={{ width: "100%" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <CalendarButtons name={confirmedName} />
            </motion.div>

            <motion.div
              style={{ width: "100%", marginTop: "12px" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <AddressBlock />
            </motion.div>

            <motion.div
              className="dm-drinks-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <span className="dm-drinks-emoji">🥂</span>
              <div>
                <p className="dm-drinks-title">Feel free to bring a drink</p>
                <p className="dm-drinks-body">
                  There will be drinks at the event. If you'd like to bring
                  something of your own to enjoy or share, you're welcome to.
                  Please drink responsibly.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── DUPLICATE ── */}
        {step === "duplicate" && (
          <motion.div
            key="duplicate"
            className="dm-screen"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="dm-check-badge dm-check-badge--amber">✓</div>

            <div className="dm-confirmed-text">
              <h2 className="dm-confirmed-title">
                Already on the list
                {duplicateName ? `, ${duplicateName.split(" ")[0]}` : ""}! 🎊
              </h2>
              <p className="dm-confirmed-sub">
                Your spot at Daya's Motive is secured.
                <br />
                See you on <strong>31st of May 2026</strong>.
              </p>
            </div>

            <CalendarButtons name={duplicateName} />

            <div style={{ width: "100%", marginTop: "12px" }}>
              <AddressBlock />
            </div>

            <div className="dm-drinks-card">
              <span className="dm-drinks-emoji">🥂</span>
              <div>
                <p className="dm-drinks-title">Feel free to bring a drink</p>
                <p className="dm-drinks-body">
                  There will be drinks at the event. If you'd like to bring
                  something of your own to enjoy or share, you're welcome to.
                  Please drink responsibly.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── EXPIRED ── */}
        {step === "expired" && (
          <motion.div
            key="expired"
            className="dm-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="dm-logo-wrap">
              <AirFnsLogo />
            </div>
            <h2 className="dm-expired-title">RSVP Closed</h2>
            <p className="dm-expired-sub">
              The invite link for Daya's Motive has expired.
              <br />
              RSVPs closed.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dm-root {
          min-height: 100dvh;
          background: linear-gradient(160deg, #FFFDF5 0%, #FFF8EE 60%, #FFFCF0 100%);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(24px,5vw,48px) clamp(16px,5vw,32px);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
          position: relative; overflow: hidden;
        }

        /* ── AMBIENT ORBS ── */
        .dm-bg-orb { position: fixed; border-radius: 50%; pointer-events: none; filter: blur(80px); }
        .dm-bg-orb--top {
          width: clamp(300px,60vw,600px); height: clamp(200px,40vw,400px);
          top: -80px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(245,158,11,0.18) 0%, rgba(249,115,22,0.07) 50%, transparent 70%);
        }
        .dm-bg-orb--bottom {
          width: clamp(200px,50vw,500px); height: clamp(150px,35vw,350px);
          bottom: -60px; right: -80px;
          background: radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%);
        }
        .dm-bg-orb--left {
          width: 320px; height: 320px;
          bottom: 20%; left: -120px;
          background: radial-gradient(ellipse, rgba(236,72,153,0.07) 0%, transparent 70%);
        }
        .dm-bg-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%);
        }

        /* ── CONFETTI ── */
        .dm-confetti { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .dm-c { position: absolute; border-radius: 2px; }
        .dm-c--1  { width:8px;  height:8px;  background:#F59E0B; top:8%;  left:10%; border-radius:50%;  opacity:0.5;  animation: dm-cfloat 8s   ease-in-out infinite 0s;   }
        .dm-c--2  { width:6px;  height:12px; background:#EF4444; top:15%; right:14%;                    opacity:0.4;  animation: dm-cfloat 10s  ease-in-out infinite 1s;   transform:rotate(-35deg); }
        .dm-c--3  { width:10px; height:5px;  background:#10B981; top:25%; left:5%;                      opacity:0.38; animation: dm-cfloat 7s   ease-in-out infinite 2s;   transform:rotate(15deg); }
        .dm-c--4  { width:7px;  height:7px;  background:#8B5CF6; top:10%; right:8%;  border-radius:50%; opacity:0.45; animation: dm-cfloat 9s   ease-in-out infinite 0.5s; }
        .dm-c--5  { width:5px;  height:10px; background:#F97316; top:70%; left:8%;                      opacity:0.32; animation: dm-cfloat 11s  ease-in-out infinite 3s;   transform:rotate(40deg); }
        .dm-c--6  { width:8px;  height:4px;  background:#EC4899; top:60%; right:10%;                    opacity:0.38; animation: dm-cfloat 8.5s ease-in-out infinite 1.5s; transform:rotate(-20deg); }
        .dm-c--7  { width:6px;  height:6px;  background:#3B82F6; top:45%; left:3%;  border-radius:50%;  opacity:0.32; animation: dm-cfloat 12s  ease-in-out infinite 2.5s; }
        .dm-c--8  { width:9px;  height:4px;  background:#F59E0B; top:80%; right:5%;                     opacity:0.38; animation: dm-cfloat 9.5s ease-in-out infinite 0.8s; transform:rotate(55deg); }
        .dm-c--9  { width:5px;  height:9px;  background:#10B981; top:90%; left:20%;                     opacity:0.28; animation: dm-cfloat 13s  ease-in-out infinite 4s;   transform:rotate(-15deg); }
        .dm-c--10 { width:7px;  height:7px;  background:#EAB308; top:5%;  left:40%; border-radius:50%;  opacity:0.45; animation: dm-cfloat 7.5s ease-in-out infinite 3.5s; }
        .dm-c--11 { width:4px;  height:8px;  background:#8B5CF6; top:85%; right:25%;                    opacity:0.3;  animation: dm-cfloat 10.5s ease-in-out infinite 1.8s; transform:rotate(30deg); }
        .dm-c--12 { width:8px;  height:3px;  background:#EC4899; top:35%; right:3%;                     opacity:0.38; animation: dm-cfloat 8s   ease-in-out infinite 2.2s; transform:rotate(-45deg); }
        @keyframes dm-cfloat {
          0%,100% { transform: translateY(0)    rotate(0deg); }
          33%     { transform: translateY(-10px) rotate(8deg); }
          66%     { transform: translateY(5px)   rotate(-4deg); }
        }

        /* ── SCREEN ── */
        .dm-screen {
          width: 100%; max-width: 460px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 0; position: relative; z-index: 1;
        }

        /* ── LOGO ── */
        .dm-logo-wrap { margin-bottom: clamp(24px,4vw,36px); }
        .dm-logo-link { display: inline-block; }
        .dm-logo {
          height: clamp(32px,5.5vw,42px); width: auto;
          filter: brightness(0) saturate(100%);
          opacity: 0.5; transition: opacity 0.2s, transform 0.2s;
        }
        .dm-logo-link:hover .dm-logo { opacity: 0.72; transform: scale(1.03); }

        /* ── HERO ── */
        .dm-hero {
          width: 100%; margin-bottom: clamp(16px,3vw,22px);
          display: flex; flex-direction: column; align-items: center;
        }
        .dm-presents-tag {
          display: inline-block;
          font-size: clamp(10px,2.5vw,12px); letter-spacing: 0.22em;
          text-transform: uppercase; color: #D97706; font-weight: 700;
          margin-bottom: clamp(8px,1.5vw,12px);
        }
        .dm-title-wrap {
          position: relative; display: inline-block;
          margin-bottom: clamp(4px,1.5vw,8px);
        }
        .dm-title {
          font-size: clamp(62px,17vw,92px); font-weight: 900;
          letter-spacing: -0.04em; line-height: 0.92;
          background: linear-gradient(145deg, #92400E 0%, #D97706 45%, #F59E0B 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .dm-sparkle {
          position: absolute; color: #F59E0B; pointer-events: none;
          animation: dm-sparkle-pulse 2.8s ease-in-out infinite;
          filter: drop-shadow(0 0 3px rgba(217,119,6,0.55));
        }
        .dm-sparkle--1 { top:-8px;   left:-16px;  font-size:clamp(12px,3vw,16px);  animation-delay:0s;   animation-duration:2.6s; }
        .dm-sparkle--2 { top:-12px;  right:-14px; font-size:clamp(8px,2vw,11px);   animation-delay:0.5s; animation-duration:3.1s; }
        .dm-sparkle--3 { bottom:8px; left:-12px;  font-size:clamp(8px,2vw,11px);   animation-delay:1s;   animation-duration:2.4s; }
        .dm-sparkle--4 { bottom:-4px;right:-18px; font-size:clamp(12px,3vw,16px);  animation-delay:1.5s; animation-duration:2.9s; }
        .dm-sparkle--5 { top:30%;    left:-22px;  font-size:clamp(7px,1.8vw,10px); animation-delay:0.8s; animation-duration:3.4s; }
        .dm-sparkle--6 { top:20%;    right:-22px; font-size:clamp(7px,1.8vw,10px); animation-delay:1.8s; animation-duration:2.7s; }
        @keyframes dm-sparkle-pulse {
          0%,100% { opacity:0; transform:scale(0.6) rotate(-10deg); }
          40%,60% { opacity:1; transform:scale(1)   rotate(5deg); }
        }
        .dm-party-tags {
          display: flex; gap: 10px; align-items: center; justify-content: center;
          font-size: clamp(18px,5vw,24px); margin-top: 8px;
          animation: dm-party-bob 3.2s ease-in-out infinite;
        }
        @keyframes dm-party-bob {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-5px); }
        }

        /* ── INVITE CARD ── */
        .dm-invite-card {
          width: 100%;
          background: #FFFFFF; border: 1.5px solid rgba(217,119,6,0.16);
          border-radius: 18px; padding: clamp(14px,3vw,22px) clamp(20px,5vw,32px);
          margin-bottom: clamp(16px,3.5vw,24px);
          box-shadow: 0 4px 24px rgba(217,119,6,0.07), 0 1px 4px rgba(0,0,0,0.04);
          display: flex; flex-direction: column; gap: 10px;
        }
        .dm-date-row { display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap; }
        .dm-date-pill {
          background: rgba(217,119,6,0.09); border: 1.5px solid rgba(217,119,6,0.28);
          color: #92400E; font-size: clamp(11px,2.5vw,13px); font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 12px; border-radius: 100px;
        }
        .dm-time-pill {
          background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.07);
          color: #44342A; font-size: clamp(11px,2.5vw,13px); font-weight: 600;
          letter-spacing: 0.06em; padding: 5px 12px; border-radius: 100px;
        }
        .dm-dot { width:3px; height:3px; border-radius:50%; background:rgba(0,0,0,0.18); }
        .dm-expiry-row { text-align:center; }
        .dm-expiry-text {
          font-size: clamp(11px,2.5vw,13px); color: #B45309;
          letter-spacing: 0.07em; text-transform: uppercase; font-weight: 600;
        }

        /* ── COUNTDOWN ── */
        .dm-countdown {
          display: flex; gap: clamp(8px,2.5vw,16px); align-items: center;
          margin-bottom: clamp(28px,5vw,44px);
        }
        .dm-cd-unit {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          min-width: clamp(44px,11vw,58px);
          background: #FFFFFF;
          border: 1.5px solid rgba(217,119,6,0.18);
          border-radius: 12px;
          padding: clamp(8px,2vw,12px) clamp(6px,1.5vw,10px);
          box-shadow: 0 2px 12px rgba(217,119,6,0.07), 0 1px 3px rgba(0,0,0,0.04);
        }
        .dm-cd-num {
          font-size: clamp(22px,6vw,32px); font-weight: 900;
          letter-spacing: -0.02em; line-height: 1;
          background: linear-gradient(145deg, #92400E 0%, #D97706 55%, #F59E0B 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .dm-cd-label {
          font-size: clamp(9px,2vw,10px); color: #9C7B60;
          text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;
        }

        /* ── CIRCLE CTA ── */
        .dm-circle-btn {
          position: relative;
          width: clamp(138px,35vw,164px); height: clamp(138px,35vw,164px);
          border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: clamp(14px,3vw,22px); background: transparent; padding: 0;
        }
        .dm-circle-inner {
          position: relative; z-index: 2; width: 100%; height: 100%; border-radius: 50%;
          background: linear-gradient(145deg, #F59E0B 0%, #EF4444 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 0 0 1px rgba(245,158,11,0.25),
            0 8px 32px rgba(245,158,11,0.5),
            0 24px 60px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .dm-circle-btn:hover .dm-circle-inner {
          transform: scale(1.05);
          box-shadow:
            0 0 0 1px rgba(245,158,11,0.4),
            0 12px 48px rgba(245,158,11,0.65),
            0 28px 64px rgba(0,0,0,0.1),
            inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .dm-circle-btn:active .dm-circle-inner { transform: scale(0.97); }
        .dm-circle-label {
          font-size: clamp(13px,3vw,15px); font-weight: 800; color: #fff;
          letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.3;
        }
        .dm-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1.5px solid rgba(245,158,11,0.4);
          animation: dm-ring-pulse 3s ease-out infinite; pointer-events: none;
        }
        .dm-ring--1 { animation-delay: 0s; }
        .dm-ring--2 { inset: -14px; border-color: rgba(245,158,11,0.22); animation-delay: 1s; }
        .dm-ring--3 { inset: -28px; border-color: rgba(245,158,11,0.1); animation-delay: 2s; }
        @keyframes dm-ring-pulse {
          0%   { opacity:1; transform:scale(1); }
          100% { opacity:0; transform:scale(1.15); }
        }
        .dm-scroll-hint {
          font-size: clamp(10px,2.5vw,12px); color: #9C7B60;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
        }

        /* ── NAME SCREEN ── */
        .dm-name-hero { width:100%; margin-bottom: clamp(20px,4vw,32px); }
        .dm-name-visual {
          position: relative;
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: clamp(18px,3.5vw,28px);
        }
        .dm-name-orb {
          position: absolute; top:50%; left:50%;
          transform: translate(-50%,-50%);
          width: clamp(120px,30vw,160px); height: clamp(120px,30vw,160px);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.26) 0%, rgba(245,158,11,0.07) 50%, transparent 70%);
          filter: blur(18px); pointer-events: none;
          animation: dm-orb-breathe 3.5s ease-in-out infinite;
        }
        @keyframes dm-orb-breathe {
          0%,100% { transform:translate(-50%,-50%) scale(1);    opacity:0.8; }
          50%     { transform:translate(-50%,-50%) scale(1.18); opacity:1;   }
        }
        .dm-name-star-wrap {
          position: relative; display:flex; align-items:center; justify-content:center;
          width: clamp(52px,12vw,68px); height: clamp(52px,12vw,68px);
          margin-bottom: 14px;
        }
        .dm-name-star {
          width:100%; height:100%;
          filter: drop-shadow(0 0 10px rgba(245,158,11,0.7)) drop-shadow(0 0 24px rgba(245,158,11,0.35));
          animation: dm-star-spin 14s linear infinite;
        }
        @keyframes dm-star-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .dm-name-micro-1,.dm-name-micro-2 {
          position:absolute; font-size:9px; color:#D97706;
          text-shadow: 0 0 6px rgba(217,119,6,0.7);
          animation: dm-sparkle-pulse 2.4s ease-in-out infinite; pointer-events:none;
        }
        .dm-name-micro-1 { top:-4px; right:-6px; animation-delay:0s; }
        .dm-name-micro-2 { bottom:-2px; left:-8px; animation-delay:1.2s; }
        .dm-name-lines { display:flex; align-items:center; gap:10px; width:clamp(160px,40vw,220px); }
        .dm-name-line-l,.dm-name-line-r {
          flex:1; height:1px;
          background: linear-gradient(90deg, transparent, rgba(217,119,6,0.35), transparent);
        }
        .dm-name-title {
          font-size: clamp(28px,7.5vw,42px); font-weight:800;
          letter-spacing:-0.03em; color:#1C1008; margin-bottom:10px; line-height:1.08;
        }
        .dm-name-sub { font-size:clamp(13px,3.5vw,15px); color:#8C6E5A; }

        /* ── FORM ── */
        .dm-form { width:100%; display:flex; flex-direction:column; gap:12px; margin-bottom:18px; }
        .dm-input-group { position:relative; width:100%; }
        .dm-input {
          width:100%;
          background:#FFFFFF; border:1.5px solid rgba(0,0,0,0.09);
          border-radius:16px;
          padding: clamp(16px,4vw,20px) clamp(18px,4vw,22px);
          font-size: clamp(17px,4.5vw,20px); font-weight:500;
          color:#1C1008; outline:none;
          transition: border-color 0.2s, box-shadow 0.2s;
          letter-spacing:0.01em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .dm-input::placeholder { color:#B8A090; font-weight:400; }
        .dm-input:focus {
          border-color: rgba(217,119,6,0.55);
          box-shadow: 0 0 0 4px rgba(245,158,11,0.09), 0 2px 16px rgba(245,158,11,0.07);
        }
        .dm-input:disabled { opacity:0.45; }

        /* ── CONSENT ── */
        .dm-consent-label {
          display:flex; align-items:flex-start; gap:12px; cursor:pointer; text-align:left;
          padding:14px 16px;
          background:#FFFFFF; border:1px solid rgba(0,0,0,0.07);
          border-radius:14px;
          transition: background 0.2s, border-color 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .dm-consent-label:hover { background:#FFFBF4; border-color:rgba(217,119,6,0.2); }
        .dm-consent-label--checked { border-color:rgba(217,119,6,0.28); background:rgba(255,251,235,0.8); }
        .dm-consent-box { position:relative; flex-shrink:0; margin-top:2px; }
        .dm-consent-check { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; z-index:1; }
        .dm-consent-tick {
          display:flex; align-items:center; justify-content:center;
          width:20px; height:20px; border-radius:6px;
          border:1.5px solid rgba(0,0,0,0.13); background:#FFFFFF;
          transition: background 0.18s, border-color 0.18s;
        }
        .dm-consent-label--checked .dm-consent-tick {
          background: linear-gradient(135deg, #F59E0B, #EF4444);
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(245,158,11,0.35);
        }
        .dm-consent-text { font-size:clamp(12px,3vw,13px); color:#6B5B4B; line-height:1.65; }
        .dm-consent-label--checked .dm-consent-text { color:#44342A; }

        /* ── SUBMIT ── */
        .dm-error { font-size:13px; color:#DC2626; text-align:left; padding:0 4px; }
        .dm-submit {
          width:100%;
          background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
          border:none; border-radius:16px;
          padding: clamp(17px,4.5vw,21px);
          font-size:clamp(14px,3.5vw,16px); font-weight:700;
          color:#fff; letter-spacing:0.06em; text-transform:uppercase;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
          min-height:58px;
          box-shadow: 0 4px 24px rgba(245,158,11,0.38), 0 2px 8px rgba(0,0,0,0.05);
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.2s;
        }
        .dm-submit:not(:disabled):hover {
          opacity:0.92; transform:translateY(-1px);
          box-shadow: 0 8px 32px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.07);
        }
        .dm-submit:disabled { opacity:0.28; cursor:not-allowed; }
        .dm-arrow { font-size:18px; }
        .dm-spinner {
          width:20px; height:20px;
          border:2px solid rgba(255,255,255,0.35); border-top-color:#fff;
          border-radius:50%; animation:dm-spin 0.7s linear infinite; display:inline-block;
        }
        @keyframes dm-spin { to{transform:rotate(360deg)} }
        .dm-back {
          background:none; border:none; color:#9C7B60; font-size:13px;
          cursor:pointer; padding:8px 12px; letter-spacing:0.04em;
          transition:color 0.2s; border-radius:8px;
        }
        .dm-back:hover { color:#44342A; }

        /* ── CONFIRMED ── */
        .dm-confirmed-glow {
          position:absolute; top:40px; left:50%; transform:translateX(-50%);
          width:300px; height:300px;
          background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%);
          pointer-events:none; z-index:0;
        }
        .dm-check-badge {
          width:clamp(56px,14vw,72px); height:clamp(56px,14vw,72px); border-radius:50%;
          background: linear-gradient(145deg, #F59E0B, #EF4444);
          display:flex; align-items:center; justify-content:center;
          font-size:clamp(22px,6vw,30px); color:#fff; font-weight:700;
          margin-bottom: clamp(16px,3.5vw,24px);
          box-shadow: 0 0 0 8px rgba(245,158,11,0.09), 0 8px 32px rgba(245,158,11,0.38);
          position:relative; z-index:1;
        }
        .dm-check-badge--amber { background: linear-gradient(145deg, #D97706, #F59E0B); }
        .dm-confirmed-text { width:100%; margin-bottom: clamp(18px,3.5vw,28px); position:relative; z-index:1; }
        .dm-confirmed-title {
          font-size:clamp(26px,7vw,38px); font-weight:800;
          letter-spacing:-0.02em; color:#1C1008; margin-bottom:12px; line-height:1.15;
        }
        .dm-confirmed-sub { font-size:clamp(13px,3.5vw,15px); color:#6B5B4B; line-height:1.8; }
        .dm-confirmed-sub strong { color:#1C1008; font-weight:600; }

        /* ── DRINKS ── */
        .dm-drinks-card {
          width:100%;
          background:#FFFFFF; border:1px solid rgba(217,119,6,0.15);
          border-radius:16px; padding: clamp(14px,3.5vw,20px) clamp(16px,4vw,22px);
          display:flex; align-items:flex-start; gap:12px; text-align:left;
          margin-bottom: clamp(10px,2.5vw,16px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .dm-drinks-emoji { font-size:clamp(18px,4.5vw,22px); flex-shrink:0; margin-top:1px; }
        .dm-drinks-title {
          font-size:clamp(10px,2.5vw,11px); font-weight:700;
          color:#92400E; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:5px;
        }
        .dm-drinks-body { font-size:clamp(12px,3vw,13px); color:#6B5B4B; line-height:1.65; }

        /* ── ADDRESS ── */
        .dm-address-card {
          width:100%; display:flex; align-items:center; gap:12px; text-align:left;
          background:#FFFFFF; border:1px solid rgba(0,0,0,0.06);
          border-radius:14px; padding: clamp(12px,3vw,16px) clamp(14px,3.5vw,20px);
          text-decoration:none; margin-bottom: clamp(12px,2.5vw,16px);
          transition: background 0.2s, border-color 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .dm-address-card:hover { background:#FFFBF4; border-color:rgba(217,119,6,0.2); }
        .dm-address-icon { color:#D97706; flex-shrink:0; }
        .dm-address-text { flex:1; display:flex; flex-direction:column; gap:2px; }
        .dm-address-line { font-size:clamp(12px,3vw,13px); color:#1C1008; font-weight:500; }
        .dm-address-sub { font-size:clamp(10px,2.5vw,11px); color:#8C6E5A; }
        .dm-address-arrow { color:#B8A090; font-size:14px; flex-shrink:0; }

        /* ── CALENDAR ── */
        .dm-cal-wrap { width:100%; display:flex; flex-direction:column; align-items:center; gap:10px; margin-bottom: clamp(12px,3vw,18px); }
        .dm-cal-label { font-size:clamp(10px,2.5vw,11px); letter-spacing:0.08em; text-transform:uppercase; color:#9C7B60; font-weight:600; }
        .dm-cal-row { width:100%; display:flex; gap:10px; }
        .dm-cal-btn {
          flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
          padding: clamp(12px,3vw,15px) 12px;
          border-radius:12px; font-size:clamp(12px,3vw,13px); font-weight:600;
          cursor:pointer; border:none; text-decoration:none; color:#fff;
          transition: opacity 0.18s, transform 0.15s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .dm-cal-btn:hover { opacity:0.88; transform:translateY(-1px); }
        .dm-cal-btn--ics { background:#1C1C1E; }
        .dm-cal-btn--google { background:#1A73E8; }
        .dm-cal-icon { width:20px; height:20px; flex-shrink:0; }

        /* ── EXPIRED ── */
        .dm-expired-icon { font-size:clamp(40px,10vw,56px); margin-bottom:20px; }
        .dm-expired-title { font-size:clamp(28px,7vw,40px); font-weight:800; color:#1C1008; letter-spacing:-0.02em; margin-bottom:16px; }
        .dm-expired-sub { font-size:clamp(13px,3.5vw,15px); color:#6B5B4B; line-height:1.75; margin-bottom:24px; }
        .dm-expired-sub strong { color:#1C1008; font-weight:600; }
        .dm-expired-footer { font-size:13px; color:#9C7B60; }

        @media (min-width:640px)  { .dm-screen { gap:4px; } }
        @media (min-width:1024px) { .dm-root { padding:60px 40px; } }
      `}</style>
    </div>
  );
}
