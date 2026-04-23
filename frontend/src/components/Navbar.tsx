import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollNav } from "../hooks/useScrollNav";

const links = [
  { label: "Work & Products", href: "#work" },
  { label: "Why AirFns", href: "#why" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const sectionIds = ["hero", "services", "work", "why", "about", "contact"];

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const scrolled = useScrollNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  // Scroll-spy: tracks per-section intersection ratio in a stable map and
  // computes the active section from the full state, not just the latest event,
  // which avoids flicker at section boundaries.
  useEffect(() => {
    const ratios = new Map<string, number>();

    function recompute() {
      let bestId = "hero";
      let bestRatio = -1;
      for (const id of sectionIds) {
        const r = ratios.get(id) ?? 0;
        if (r > bestRatio) {
          bestRatio = r;
          bestId = id;
        }
      }
      setActiveSection((prev) => (prev === bestId ? prev : bestId));
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target.id) ratios.set(e.target.id, e.intersectionRatio);
        }
        recompute();
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        ratios.set(id, 0);
        obs.observe(el);
      }
    });
    return () => obs.disconnect();
  }, []);

  function isActive(href: string) {
    return activeSection === href.replace("#", "");
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        menuOpen ? "nav-solid" : scrolled ? "nav-scrolled" : "bg-transparent"
      }`}
    >
      {/* Hairline gradient divider — only shows when scrolled */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-px transition-opacity duration-500 ${
          scrolled || menuOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(229,62,62,0.4), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group relative flex items-center gap-3 focus:outline-none"
          aria-label="AirFns Softwares, Home"
          data-testid="nav-logo"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -inset-x-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(229,62,62,0.18) 0%, transparent 60%)",
              filter: "blur(8px)",
            }}
          />
          <img
            src="/assets/airfns-logo.png"
            alt="AirFns Softwares"
            className="relative h-12 w-auto select-none transition-transform duration-300 group-hover:scale-[1.04]"
            style={{ filter: "invert(1) hue-rotate(180deg)" }}
            draggable={false}
          />
          <span className="hidden lg:flex items-center gap-2 pl-3 ml-1 border-l border-[#2A2A2A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF]">
              Online · Building
            </span>
          </span>
        </button>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((link, idx) => {
            const active = isActive(link.href);
            return (
              <li key={link.label}>
                <button
                  onClick={() => scrollTo(link.href)}
                  className={`group relative flex items-center gap-2 text-sm font-medium px-3 lg:px-4 py-2 transition-colors duration-200 whitespace-nowrap ${
                    active ? "text-white" : "text-[#9CA3AF] hover:text-white"
                  }`}
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+&\s+|\s+/g, "-")}`}
                >
                  <span className="hidden lg:inline font-mono text-[10px] text-[#6B7280] group-hover:text-[#E53E3E] transition-colors">
                    0{idx + 1}
                  </span>
                  <span>{link.label}</span>
                  {/* Underline — animated for hover, solid for active */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-2 right-2 lg:left-3 lg:right-3 bottom-1 h-px origin-left transition-transform duration-300 bg-[#E53E3E] ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                  {active && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="w-1 h-1 rounded-full bg-[#E53E3E]"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          data-testid="nav-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block w-5 h-px bg-white transition-all"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-px bg-white"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="block w-5 h-px bg-white transition-all"
          />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-20 bg-[#0A0A0A] z-40 flex flex-col items-center justify-center"
          >
            <ul className="flex flex-col items-center gap-8">
              {links.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-baseline gap-3"
                >
                  <span className="font-mono text-xs text-[#E53E3E]">0{i + 1}</span>
                  <button
                    onClick={() => {
                      scrollTo(link.href);
                      setMenuOpen(false);
                    }}
                    className="text-3xl font-bold text-white hover:text-[#E53E3E] transition-colors"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
            <div className="mt-16 flex items-center gap-2 text-[10px] font-mono text-[#6B7280] tracking-[0.2em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Building · UK & Nigeria
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
