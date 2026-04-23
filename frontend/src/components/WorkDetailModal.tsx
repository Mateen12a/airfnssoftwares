import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface WorkProject {
  id: string;
  name: string;
  tagline: string;
  shortDescription: string;
  detailedDescription: string;
  features: string[];
  airFnsRole: string;
  url: string;
  logo: string;
  logoBg: string;
  accent: string;
  tags: string[];
}

interface Props {
  project: WorkProject | null;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea';

export default function WorkDetailModal({ project, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!project) return;

    // Remember the element that opened the modal so we can restore focus on close
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap on Tab
      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    // Defer initial focus until the panel is mounted
    const t = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(t);
      // Restore focus to the element that opened the modal
      previouslyFocused.current?.focus?.();
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
          data-testid="work-modal-backdrop"
        >
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`work-modal-title-${project.id}`}
            aria-describedby={`work-modal-desc-${project.id}`}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-[#0F0F0F] border border-[#2A2A2A] shadow-[0_30px_80px_rgba(0,0,0,0.6)] my-8 md:my-0 focus:outline-none"
            data-testid={`work-modal-${project.id}`}
          >
            {/* Close button */}
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close detail view"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#E53E3E]/50 hover:bg-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/40 transition-all duration-200 flex items-center justify-center"
              data-testid="btn-close-modal"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            </button>

            {/* Logo banner */}
            <div
              className="h-44 flex items-center justify-center overflow-hidden relative"
              style={{ background: project.logoBg }}
            >
              <img
                src={project.logo}
                alt={`${project.name} logo`}
                className="max-h-20 w-auto object-contain"
                draggable={false}
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${project.accent}, transparent)` }}
              />
            </div>

            <div className="p-7 md:p-10 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-wrap items-baseline gap-3 mb-2">
                <h3
                  id={`work-modal-title-${project.id}`}
                  className="text-white font-extrabold text-2xl md:text-3xl tracking-tight"
                >
                  {project.name}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B7280]">
                  Live Project
                </span>
              </div>
              <p className="text-[#FCA5A5] text-sm font-mono tracking-wide mb-6">{project.tagline}</p>

              <p
                id={`work-modal-desc-${project.id}`}
                className="text-[#D1D5DB] leading-relaxed mb-8"
              >
                {project.detailedDescription}
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E53E3E] mb-3">
                    What's inside
                  </p>
                  <ul className="space-y-2.5">
                    {project.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-[#9CA3AF]">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                          style={{ background: project.accent }}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E53E3E] mb-3">
                    AirFns delivered
                  </p>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">{project.airFnsRole}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] text-[#9CA3AF] border border-[#2A2A2A] bg-[#161616] px-2.5 py-1 tracking-wider uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-[#1F1F1F]">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#E53E3E] hover:bg-[#D53030] text-white font-semibold text-sm px-6 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/40"
                  data-testid={`btn-visit-${project.id}`}
                >
                  Visit Full Website
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M2 11L11 2M11 2H5M11 2v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-white/15 text-[#9CA3AF] hover:text-white hover:border-white/30 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                  data-testid="btn-close-modal-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
