import { lazy, Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "./MagneticButton";
import HeroAmbientMobile from "./HeroAmbientMobile";

const HeroOrb = lazy(() => import("./HeroOrb"));

const headline = "We Build Systems That Think".split(" ");

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Hero() {
  const { scrollY } = useScroll();
  const orbY = useTransform(scrollY, [0, 800], [0, 120]);
  const orbScale = useTransform(scrollY, [0, 800], [1, 0.85]);
  const orbOpacity = useTransform(scrollY, [0, 600], [1, 0.25]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 md:pt-0 md:pb-0" id="hero">
      {/* Soft vignette — replaces the rigid grid lines for a calmer, deeper canvas */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 35%, transparent 0%, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Soft red ambient glow behind the orb — viewport-relative so it never dominates a small screen */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="w-[min(90vw,700px)] h-[min(90vw,700px)] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(229,62,62,0.14) 0%, rgba(229,62,62,0.04) 45%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* Live 3D orb — the heartbeat of the page (desktop only). */}
      <motion.div
        style={{ y: orbY, scale: orbScale, opacity: orbOpacity }}
        className="absolute inset-0 pointer-events-none hidden md:block"
      >
        <Suspense fallback={null}>
          <HeroOrb />
        </Suspense>
      </motion.div>

      {/* Lightweight CSS-only ambient layer — fills the orb's role on phones. */}
      <HeroAmbientMobile />

      <div className="relative z-10 text-center px-5 sm:px-6 max-w-5xl mx-auto w-full">
        <motion.div
          className="overflow-hidden mb-5 sm:mb-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
          }}
        >
          <h1 className="text-[2.1rem] xs:text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-[1.08] md:leading-[1.02] tracking-tight flex flex-wrap justify-center gap-x-2 sm:gap-x-3 md:gap-x-4">
            {headline.map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed"
        >
          AirFns Softwares Ltd builds AI-powered platforms and digital infrastructure for organisations that want to move faster, smarter, and further.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto"
        >
          <MagneticButton
            variant="primary"
            onClick={() => scrollTo("#work")}
            className="px-7 sm:px-8 py-3.5 w-full sm:w-auto"
            data-testid="hero-cta-work"
          >
            See Our Work
          </MagneticButton>
          <MagneticButton
            variant="outline"
            onClick={() => scrollTo("#contact")}
            className="px-7 sm:px-8 py-3.5 w-full sm:w-auto"
            data-testid="hero-cta-contact"
          >
            Get In Touch
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 sm:mt-16 flex items-center justify-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs md:text-sm font-mono tracking-[0.18em] uppercase">
            <span className="hidden sm:block w-10 h-px bg-gradient-to-r from-transparent to-[#3A3A3A]" />
            <span className="text-[#E5E5E5]">Built Quietly</span>
            <span className="text-[#E53E3E]">·</span>
            <span className="text-[#E5E5E5]">Shipped Boldly</span>
            <span className="text-[#E53E3E]">·</span>
            <span className="text-[#E5E5E5]">Designed Differently</span>
            <span className="hidden sm:block w-10 h-px bg-gradient-to-l from-transparent to-[#3A3A3A]" />
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#2A2A2A]" />
        </motion.div>
      </div>
    </section>
  );
}
