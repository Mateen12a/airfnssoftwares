import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tilt3DCard from "./Tilt3DCard";
import WorkDetailModal, { type WorkProject } from "./WorkDetailModal";

const workProjects: WorkProject[] = [
  {
    id: "mywellbeing",
    name: "mywellbeingtoday",
    tagline: "Your personal wellbeing companion",
    shortDescription: "A digital wellbeing platform. Log activities, track mood, generate wellbeing reports, and connect with verified health and social care providers.",
    detailedDescription: "mywellbeingtoday brings personal wellbeing tracking and professional care into one secure place. Individuals log daily activities, run mood analysis and generate structured wellbeing reports they can share with their support network. Alongside the personal experience sits a verified providers directory and full organisation tooling, giving health and social care teams their own dashboards, intake flows and member management. Privacy and trust are first-class: the platform is built to be secure, private and verified.",
    features: [
      "Activity Log: daily check-ins and habit tracking",
      "Mood Analysis: patterns over time, not just a number",
      "AI-assisted Wellbeing Insights",
      "Downloadable Wellbeing Reports to share with care",
      "Verified Health & Social Care Providers Directory",
      "Organisation tooling for providers and care teams",
      "Secure, private and verified architecture",
    ],
    airFnsRole: "AirFns Softwares architected and shipped mywellbeingtoday end-to-end, from product strategy and information architecture through to the full-stack build, AI tooling and provider onboarding. The platform was designed from day one to scale across both individual and organisational use, with a privacy-first foundation appropriate for the health and social care sector.",
    url: "https://mywellbeingtoday.com",
    logo: "/assets/mywellbeingtoday-logo.png",
    logoBg: "#FFFFFF",
    accent: "#7DA9C9",
    tags: ["Digital Health", "Wellbeing", "AI", "Multi-tenant", "UK"],
  },
  {
    id: "globalhealth",
    name: "Global Health Works",
    tagline: "Where global health problems meet global health solutions",
    shortDescription: "A two-sided marketplace for global health work. Organisations post tasks. Skilled health workers take them on.",
    detailedDescription: "Global Health Works is a marketplace platform built around a clear mission: connecting the people with global health problems to the people with global health solutions. On one side, organisations post tasks: research, fieldwork, advisory, technical builds. On the other, a network of global health workers can discover and apply for the work they're best placed to deliver. The system handles the full task lifecycle, from posting and discovery through onboarding and engagement, designed to operate across borders.",
    features: [
      "Two-sided marketplace: post a task, work on tasks",
      "Task posting, discovery and matching",
      "Worker profiles and onboarding flows",
      "Cross-border, multi-region by design",
      "Built specifically for the global health sector",
    ],
    airFnsRole: "AirFns Softwares delivered the marketplace from the ground up: the matching layer, the dual-sided onboarding (post a task / take a task), the trust signals and the operational workflows that keep a marketplace flowing. The product was engineered for cross-border use from day one.",
    url: "https://globalhealth.works",
    logo: "/assets/globalhealthworks-logo.svg",
    logoBg: "#FFFFFF",
    accent: "#F97316",
    tags: ["Marketplace", "Global Health", "Two-sided", "Cross-border"],
  },
  {
    id: "globalhealthjobs",
    name: "Global Health Jobs",
    tagline: "A specialist work resource for special people",
    shortDescription: "The dedicated jobs board for global health. The best roles in the sector, finally in one place, matched with the people who can fill them.",
    detailedDescription: "Global Health Jobs is a specialist careers platform for the global health sector. The product brings together employers, recruiters and global health professionals around a focused jobs board, with employer profiles, structured job listings, candidate accounts and applicant workflows. It is built around a single thesis: the best jobs in global health should not be scattered across generic boards, they should live in one place where the right people can find them.",
    features: [
      "Specialist global health jobs board",
      "Employer accounts and company profiles",
      "Structured job posting and applicant flows",
      "Candidate profiles and saved searches",
      "Designed for the global health labour market",
    ],
    airFnsRole: "AirFns Softwares contributed the engineering and platform work that keeps Global Health Jobs running as a sector-specific marketplace, including job posting workflows, employer/candidate account flows and the integrations that hold the listings, applications and notifications together.",
    url: "https://globalhealthjobs.com",
    logo: "/assets/ghj-logo.png",
    logoBg: "#FFFFFF",
    accent: "#3B82F6",
    tags: ["Jobs Board", "Global Health", "Recruitment", "Marketplace"],
  },
  {
    id: "esave",
    name: "E-save",
    tagline: "Repurposing old electronics, reducing e-waste",
    shortDescription: "A platform for repurposing old electronics to reduce electronic waste and improve community health, with secure data handling and traceable device flow.",
    detailedDescription: "E-save tackles a quiet but growing public-health problem: electronic waste. The platform gives individuals and organisations a structured way to retire, donate and repurpose old electronics so devices stop being dumped and start being reused. The system tracks devices through their second life, with the operational tooling needed to keep an e-waste programme honest and auditable, and is designed for community-scale rollout.",
    features: [
      "Device intake and lifecycle tracking",
      "Repurposing and donation workflows",
      "Community and organisation accounts",
      "Built around environmental and public-health outcomes",
      "Auditable, traceable device flow",
    ],
    airFnsRole: "AirFns Softwares built E-save end-to-end, from the device-tracking model and intake flows to the public-facing site and operational dashboards. The product was engineered to be lightweight enough to deploy at the community level while staying rigorous about chain-of-custody for each device.",
    url: "https://e-save.org.uk",
    logo: "/assets/esave-logo.png",
    logoBg: "#FFFFFF",
    accent: "#22C55E",
    tags: ["E-waste", "Sustainability", "Community Health", "UK"],
  },
];

const products = [
  {
    id: "carbioo",
    name: "Carbioo AI",
    status: "In Development" as const,
    description:
      "An AI-powered carbon tracking and reduction platform for the maritime sector. Carbioo AI gives regulators, operators and policymakers the data infrastructure they need to measure, report and reduce emissions in line with international standards.",
    tags: ["AI", "Carbon Tech", "Maritime", "RegTech"],
    featured: true,
  },
];

export default function WorkAndProducts() {
  const [activeTab, setActiveTab] = useState<"work" | "products">("work");
  const [activeProject, setActiveProject] = useState<WorkProject | null>(null);

  return (
    <section className="py-32 border-t border-[#1F1F1F]" id="work">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <p className="text-[#E53E3E] font-mono text-xs tracking-[0.2em] uppercase mb-6">
            {activeTab === "work" ? "Client Projects" : "Our Products"}
          </p>

          <div className="flex items-center gap-1 p-1 bg-[#111111] border border-[#1F1F1F] rounded-sm w-fit">
            {(["work", "products"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-2 text-sm font-medium capitalize transition-colors duration-200 rounded-sm ${
                  activeTab === tab ? "text-white" : "text-[#6B7280] hover:text-[#9CA3AF]"
                }`}
                data-testid={`tab-${tab}`}
                id={tab === "products" ? "products" : undefined}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === "work" ? "Work" : "Products"}
                  {activeTab === tab && <span className="w-1.5 h-1.5 rounded-full bg-[#E53E3E]" />}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "work" ? (
            <motion.div
              key="work"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {workProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Tilt3DCard
                    max={5}
                    onClick={() => setActiveProject(project)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveProject(project);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${project.name} project details`}
                    data-testid={`work-card-${project.id}`}
                    className="group block bg-[#111111] border border-[#1F1F1F] card-hover-glow transition-colors duration-300 cursor-pointer focus:outline-none focus:border-[#E53E3E]/50 focus:shadow-[0_0_0_2px_rgba(229,62,62,0.25)]"
                  >
                    {/* Logo banner — unified white canvas, with a subtle
                        brand-coloured wash behind the logo and a glowing
                        accent line at the bottom that "bleeds" the brand
                        colour into the card body below. */}
                    <div
                      className="h-40 border-b border-[#1F1F1F] flex items-center justify-center overflow-hidden relative"
                      style={{ background: project.logoBg }}
                    >
                      {/* Top hairline — full brand colour, faint by default,
                          full strength on hover. Reads as a brand ribbon. */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-px opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: project.accent }}
                      />

                      {/* Soft radial wash from the bottom in the brand colour.
                          Subtle on white but lifts the whole banner out of
                          flatness, and intensifies on hover. */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `radial-gradient(120% 70% at 50% 110%, ${project.accent}26 0%, ${project.accent}10 35%, transparent 65%)`,
                        }}
                      />

                      {/* Soft side vignette in brand colour, gives the white
                          banner a tinted, alive feel. */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(90deg, ${project.accent}1A 0%, transparent 18%, transparent 82%, ${project.accent}1A 100%)`,
                        }}
                      />

                      <img
                        src={project.logo}
                        alt={`${project.name} logo`}
                        className="relative max-h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                        style={{ transform: "translateZ(30px)" }}
                        draggable={false}
                      />

                      {/* Glowing brand-colour bottom line. The shadow projects
                          the colour down into the body section so the white
                          banner and the dark body feel connected. */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-[2px]"
                        style={{
                          background: `linear-gradient(90deg, transparent 0%, ${project.accent}99 18%, ${project.accent} 50%, ${project.accent}99 82%, transparent 100%)`,
                          boxShadow: `0 0 14px ${project.accent}80, 0 6px 22px ${project.accent}40`,
                        }}
                      />

                      {/* Open-detail badge */}
                      <div
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ transform: "translateZ(50px)" }}
                      >
                        <div className="px-2.5 py-1 rounded-full bg-[#0A0A0A]/85 border border-[#2A2A2A] backdrop-blur-sm flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{
                              background: project.accent,
                              boxShadow: `0 0 8px ${project.accent}`,
                            }}
                          />
                          <span className="text-white text-[10px] font-mono tracking-wider uppercase">
                            View details
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6" style={{ transform: "translateZ(20px)" }}>
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="text-white font-bold text-lg group-hover:text-[#E53E3E] transition-colors duration-200">
                          {project.name}
                        </h3>
                        <span className="text-[#6B7280] text-xs font-mono">
                          Live
                        </span>
                      </div>
                      <p className="text-[#FCA5A5]/70 text-xs font-mono tracking-wide mb-3">
                        {project.tagline}
                      </p>
                      <p className="text-[#9CA3AF] text-sm leading-relaxed mb-4">{project.shortDescription}</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] text-[#9CA3AF] border border-[#2A2A2A] px-2.5 py-1 tracking-wider uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-[#1F1F1F]">
                        <span className="text-white text-sm font-medium inline-flex items-center gap-2 group-hover:text-[#E53E3E] transition-colors">
                          See project details
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Tilt3DCard>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {products.map((product, i) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative bg-[#111111] border border-[#1F1F1F] card-hover-glow transition-all duration-300 overflow-hidden"
                  data-testid={`product-card-${product.id}`}
                >
                  {/* Ambient green glow — Carbioo's brand hue */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-32 -right-20 w-80 h-80 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700"
                    style={{
                      background: "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 60%)",
                      filter: "blur(40px)",
                    }}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-3 relative">
                    <div className="lg:col-span-1 bg-[#0D0D0D] border-b lg:border-b-0 lg:border-r border-[#1F1F1F] p-6 md:p-8 lg:p-10 flex flex-col items-start justify-between">
                      <div className="w-full">
                        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E53E3E] mb-4 flex items-center gap-2">
                          <span className="w-6 h-px bg-[#E53E3E]" />
                          Product 01
                        </div>
                        {/* Carbioo brand asset on its native white background */}
                        <a
                          href="https://carbiooai.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-white rounded-md px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_40px_rgba(34,197,94,0.25)] transition-shadow duration-300"
                          aria-label="Visit Carbioo AI"
                          data-testid="link-carbioo-logo"
                        >
                          <img
                            src="/assets/carbioo-logo.png"
                            alt="Carbioo AI"
                            className="h-9 w-auto select-none"
                            draggable={false}
                          />
                        </a>

                        {/* Decorative leaf/sprout sprite */}
                        <img
                          src="/assets/carbioo-sprout.png"
                          alt=""
                          aria-hidden="true"
                          className="absolute -bottom-6 -left-6 w-32 h-32 opacity-[0.06] pointer-events-none select-none"
                          draggable={false}
                          onError={(e) => ((e.currentTarget.style.display = "none"))}
                        />
                      </div>
                      <span className="mt-6 inline-flex items-center gap-1.5 border border-[#E53E3E]/30 bg-[#E53E3E]/10 text-[#FCA5A5] font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 relative z-10">
                        <span className="w-1 h-1 rounded-full bg-[#E53E3E] inline-block animate-pulse" />
                        {product.status}
                      </span>
                    </div>

                    <div className="lg:col-span-2 p-6 md:p-8 flex flex-col justify-between relative z-10">
                      <div>
                        <h3 className="text-white text-2xl font-bold mb-3 tracking-tight">
                          {product.name}
                          <span className="text-[#6B7280] text-xs font-mono align-top ml-2">™</span>
                        </h3>
                        <p className="text-[#9CA3AF] leading-relaxed mb-6">{product.description}</p>
                        <div className="flex flex-wrap gap-2 mb-8">
                          {product.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-[10px] text-[#9CA3AF] border border-[#2A2A2A] px-2.5 py-1 tracking-wider uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group/btn">
                          <button
                            disabled
                            title="Coming soon"
                            className="cursor-not-allowed inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] text-[#6B7280] text-sm px-5 py-2.5 font-medium"
                            data-testid="product-coming-soon-carbioo"
                          >
                            Coming Soon
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M6 1v10M1 6l5-5 5 5" />
                            </svg>
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#161616] border border-[#2A2A2A] text-[#9CA3AF] text-xs whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none font-mono">
                            Coming soon
                          </div>
                        </div>
                        <a
                          href="https://carbiooai.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-white text-sm font-medium transition-colors"
                          data-testid="link-carbioo-preview"
                        >
                          Visit preview site
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 10L10 2M10 2H5M10 2v5" />
                          </svg>
                        </a>
                        <span className="text-[#6B7280] text-xs font-mono">
                          Carbioo AI™. Trademarked in the United Kingdom
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WorkDetailModal project={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  );
}
