import { motion } from "framer-motion";

const stats = [
  { num: "01", label: "Founded 2023", sub: "Built quietly. Shipping consistently. Compounding fast." },
  { num: "02", label: "Hybrid Team", sub: "United Kingdom and Nigeria presence, global outlook." },
  { num: "03", label: "AI-Native", sub: "Intelligence is not a feature. It is the foundation." },
  { num: "04", label: "0 to Deployed", sub: "From whiteboard to live system, without cutting corners." },
];

export default function WhyAirFns() {
  return (
    <section className="py-32 bg-[#0D0D0D] border-t border-b border-[#1F1F1F]" id="why">
      <div className="max-w-7xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[#E53E3E] font-mono text-xs tracking-[0.2em] uppercase mb-16"
        >
          Why AirFns
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-0">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex items-start gap-5 py-6 border-b border-[#1F1F1F] group overflow-hidden"
                data-testid={`why-stat-${i}`}
              >
                {/* Sliding accent bar on hover */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 bottom-0 w-px bg-[#E53E3E] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"
                />
                <div className="font-mono text-[10px] tracking-wider text-[#E53E3E] mt-2 w-8 flex-shrink-0">
                  {stat.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-xl mb-1 group-hover:translate-x-1 transition-transform duration-300">{stat.label}</h3>
                  <p className="text-[#6B7280] text-sm">{stat.sub}</p>
                </div>
                <span aria-hidden="true" className="self-center text-[#2A2A2A] group-hover:text-[#E53E3E] group-hover:translate-x-1 transition-all duration-300">→</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:pt-6"
          >
            <div className="relative">
              <div
                className="absolute -left-4 top-0 bottom-0 w-px"
                style={{ background: "linear-gradient(to bottom, #E53E3E, transparent)" }}
              />
              <p className="text-[#9CA3AF] text-lg leading-relaxed pl-4">
                AirFns Softwares Ltd is not a typical agency. We are builders. A hybrid team operating across the United Kingdom and Nigeria, building systems at the intersection of artificial intelligence, regulatory technology and human experience. Every product we ship is designed to last.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-6">
              {[["AI", "Systems"], ["RegTech", "Ready"], ["Built", "to Last"]].map(([top, bottom], i) => (
                <div key={i} className="border border-[#1F1F1F] bg-[#111111] p-4 text-center">
                  <div className="text-white font-bold text-sm">{top}</div>
                  <div className="text-[#E53E3E] font-mono text-xs mt-0.5">{bottom}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
