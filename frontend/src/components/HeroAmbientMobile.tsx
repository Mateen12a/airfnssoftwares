/**
 * Mobile-only ambient layer.
 *
 * The 3D orb is skipped on phones for performance. This CSS-only layer fills the
 * void with two slow-drifting blurred auras and a faint scanning sweep so the
 * hero still feels alive — without spinning up WebGL or draining the battery.
 *
 * Pure transform/opacity animations → GPU-accelerated, won't trigger layout.
 * Honors prefers-reduced-motion (animations disabled in index.css).
 */
export default function HeroAmbientMobile() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none md:hidden"
    >
      {/* Drifting red aura */}
      <div
        className="absolute rounded-full will-change-transform animate-orb-drift-a"
        style={{
          top: "20%",
          left: "10%",
          width: "70vw",
          height: "70vw",
          background:
            "radial-gradient(circle, rgba(229,62,62,0.22) 0%, rgba(229,62,62,0.05) 45%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Drifting cool aura — adds depth + temperature contrast */}
      <div
        className="absolute rounded-full will-change-transform animate-orb-drift-b"
        style={{
          bottom: "15%",
          right: "5%",
          width: "60vw",
          height: "60vw",
          background:
            "radial-gradient(circle, rgba(59,74,107,0.20) 0%, rgba(59,74,107,0.05) 45%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Tiny pulsing core — the "heartbeat" the orb used to provide */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-2 h-2 rounded-full bg-[#E53E3E] animate-heartbeat"
          style={{ boxShadow: "0 0 20px 6px rgba(229,62,62,0.45)" }}
        />
      </div>

      {/* Slow scanning hairline — subtle "system online" feel */}
      <div className="absolute inset-x-0 top-0 h-[1px] animate-scanline">
        <div className="h-full w-1/2 mx-auto bg-gradient-to-r from-transparent via-[#E53E3E]/50 to-transparent" />
      </div>
    </div>
  );
}
