import { motion } from "framer-motion";

const links = [
  { label: "Work", href: "#work" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  return (
    <footer className="border-t border-[#1F1F1F] bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 items-start mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center mb-3"
              aria-label="AirFns Softwares, Home"
            >
              <img
                src="/assets/airfns-logo.png"
                alt="AirFns Softwares"
                className="h-8 w-auto select-none"
                style={{ filter: "invert(1) hue-rotate(180deg)" }}
                draggable={false}
              />
            </button>
            <p className="text-[#6B7280] text-xs font-mono leading-relaxed mt-3">
              We Build Systems That Think
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-center">
            {links.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="text-[#6B7280] hover:text-white text-sm transition-colors duration-200 whitespace-nowrap"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="sm:text-right">
            <a
              href="mailto:hello@airfnssoftwares.com"
              className="text-[#9CA3AF] hover:text-white text-sm transition-colors duration-200 break-all sm:break-normal"
            >
              hello@airfnssoftwares.com
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1F1F1F] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-[#6B7280] text-xs font-mono">
            © 2023–2026 AirFns Softwares Ltd. All rights reserved.
          </p>
          <p className="text-[#6B7280] text-xs font-mono">
            Carbioo AI™. Trademarked in the United Kingdom
          </p>
        </div>
      </div>
    </footer>
  );
}
