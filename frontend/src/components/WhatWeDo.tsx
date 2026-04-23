import { motion } from "framer-motion";
import Tilt3DCard from "./Tilt3DCard";

const services = [
  {
    id: "ai",
    num: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="14" r="4" />
        <path d="M14 3v4M14 21v4M3 14h4M21 14h4" />
        <path d="M6.34 6.34l2.83 2.83M18.84 18.84l2.83 2.83M6.34 21.66l2.83-2.83M18.84 9.16l2.83-2.83" />
        <circle cx="14" cy="14" r="9" strokeDasharray="2 3" />
      </svg>
    ),
    title: "AI Integration",
    description: "Embedding real intelligence into products. Assistants, recommendation engines and decision-support systems that change how teams operate.",
  },
  {
    id: "platform",
    num: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="22" height="6" rx="1" />
        <rect x="3" y="11" width="22" height="6" rx="1" />
        <rect x="3" y="19" width="22" height="6" rx="1" />
        <circle cx="7" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="7" cy="14" r="1" fill="currentColor" stroke="none" />
        <circle cx="7" cy="22" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: "Platform Engineering",
    description: "Full-stack digital platforms built to handle real users, real data and real scale. We build for longevity, not launch day.",
  },
  {
    id: "health",
    num: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 25s-9-5.5-9-13a5 5 0 019-3 5 5 0 019 3c0 7.5-9 13-9 13z" />
        <path d="M9 12h2l1.5-3 3 6 1.5-3H19" />
      </svg>
    ),
    title: "Digital Health & Wellbeing",
    description: "Privacy-first health platforms. Patient-facing apps, provider tooling and care marketplaces. Built for sensitive data and real lives.",
  },
  {
    id: "climate",
    num: "04",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3C8.48 3 4 7.48 4 13c0 3.5 1.75 6.6 4.42 8.5" />
        <path d="M14 25V13" />
        <path d="M14 13l-6-6" />
        <path d="M14 13l5-4" />
        <circle cx="14" cy="13" r="2" />
        <path d="M22 16a4 4 0 01-4 4H12" />
      </svg>
    ),
    title: "Climate & Carbon Tech",
    description: "Emissions intelligence, sustainability reporting and the data infrastructure industries need to measure, report and reduce impact.",
  },
  {
    id: "hospitality",
    num: "05",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 23h22M5 23V11l9-6 9 6v12" />
        <rect x="9" y="15" width="4" height="8" />
        <rect x="15" y="15" width="4" height="5" />
        <path d="M5 11h18" />
      </svg>
    ),
    title: "Hospitality & Operations",
    description: "Booking systems, operations platforms and guest-facing experiences engineered to handle peak load without breaking a sweat.",
  },
  {
    id: "data",
    num: "06",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 23h22" />
        <path d="M6 23V14M11 23V8M16 23v-7M21 23V11" />
        <circle cx="6" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="11" cy="8" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="21" cy="11" r="1.5" fill="currentColor" stroke="none" />
        <path d="M6 14l5-6 5 8 5-5" strokeOpacity="0.5" />
      </svg>
    ),
    title: "Data & Analytics",
    description: "Pipelines, dashboards and AI-driven insight that turn raw data into decisions executives can actually act on.",
  },
];

const otherSectors = [
  "Construction Tech",
  "RegTech & Compliance",
  "Maritime",
  "Logistics",
  "Education",
  "NGO Sector",
  "Fintech",
];

export default function WhatWeDo() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto" id="services">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16 max-w-3xl"
      >
        <p className="text-[#E53E3E] font-mono text-xs tracking-[0.2em] uppercase mb-4">What We Do</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
          We don't just write code. We architect across industries.
        </h2>
        <p className="text-[#9CA3AF] text-base md:text-lg leading-relaxed">
          From digital health to climate intelligence, hospitality to data, we build the systems each industry didn't think it could have.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1F1F1F]">
        {services.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
            data-testid={`service-card-${service.id}`}
          >
            <Tilt3DCard
              max={6}
              className="group block bg-[#111111] p-6 md:p-7 xl:p-8 h-full overflow-hidden card-hover-glow transition-colors duration-300 border border-transparent"
            >
              {/* Corner accents */}
              <span aria-hidden="true" className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#2A2A2A] group-hover:border-[#E53E3E]/60 transition-colors duration-300" />
              <span aria-hidden="true" className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#2A2A2A] group-hover:border-[#E53E3E]/60 transition-colors duration-300" />

              {/* Number badge */}
              <div
                className="font-mono text-[10px] tracking-[0.2em] text-[#6B7280] mb-5"
                style={{ transform: "translateZ(20px)" }}
              >
                {service.num} / {String(services.length).padStart(2, "0")}
              </div>

              <div
                className="text-[#9CA3AF] group-hover:text-[#E53E3E] transition-colors duration-300 mb-6"
                style={{ transform: "translateZ(40px)" }}
              >
                {service.icon}
              </div>
              <h3
                className="text-white font-bold text-lg mb-3"
                style={{ transform: "translateZ(28px)" }}
              >
                {service.title}
              </h3>
              <p
                className="text-[#9CA3AF] text-sm leading-relaxed"
                style={{ transform: "translateZ(18px)" }}
              >
                {service.description}
              </p>
            </Tilt3DCard>
          </motion.div>
        ))}
      </div>

      {/* Also building for — sector marquee strip */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-16 pt-8 border-t border-[#1F1F1F] flex flex-wrap items-center gap-x-6 gap-y-3"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E53E3E]">
          Also Building For
        </span>
        {otherSectors.map((sector) => (
          <span
            key={sector}
            className="font-mono text-xs text-[#6B7280] hover:text-[#9CA3AF] transition-colors duration-200 cursor-default tracking-wide"
          >
            {sector}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
