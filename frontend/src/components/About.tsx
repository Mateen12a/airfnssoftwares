import { motion } from "framer-motion";

const values = [
  {
    id: "transparency",
    title: "Transparency",
    description: "We tell you what things really require. No surprises.",
  },
  {
    id: "execution",
    title: "Execution",
    description: "We ship. Fast and properly. Not one or the other.",
  },
  {
    id: "intelligence",
    title: "Intelligence",
    description: "AI is not a feature to us. It is a foundation.",
  },
  {
    id: "impact",
    title: "Impact",
    description: "We measure success by what changes, not what ships.",
  },
];

export default function About() {
  return (
    <section className="py-32 bg-[#0D0D0D] border-t border-[#1F1F1F]" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <p className="text-[#E53E3E] font-mono text-xs tracking-[0.2em] uppercase mb-4">About</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Built different. On purpose.
          </h2>
          <p className="text-[#9CA3AF] text-lg leading-relaxed max-w-3xl">
            AirFns Softwares was founded with one conviction: that the most important technology problems are the ones most organisations are not yet equipped to solve. We build at the frontier of AI, climate technology and digital infrastructure. Not because it is easy, but because it is where we can create lasting value.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-0">
            {values.map((value, i) => (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-5 py-6 border-b border-[#1F1F1F]"
                data-testid={`value-card-${value.id}`}
              >
                <div
                  className="mt-0 w-0.5 h-full self-stretch flex-shrink-0"
                  style={{ background: "#E53E3E", minHeight: "48px" }}
                />
                <div>
                  <h3 className="text-white font-bold text-base mb-1">{value.title}</h3>
                  <p className="text-[#6B7280] text-sm">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:pt-6 space-y-8"
          >
            <div className="bg-[#111111] border border-[#1F1F1F] p-8">
              <p className="text-[#9CA3AF] leading-relaxed text-base">
                We are a lean, globally operational team. We work across time zones, industries and disciplines, united by the belief that great software changes things.
              </p>
            </div>

            <div className="bg-[#111111] border border-[#1F1F1F] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[#4B5563] font-mono text-[10px] tracking-wider uppercase mb-1">Reg. No.</p>
                <p className="text-[#9CA3AF] font-mono text-sm">6991159</p>
              </div>
              <div className="text-right">
                <p className="text-[#4B5563] font-mono text-[10px] tracking-wider uppercase mb-1">Status</p>
                <p className="text-[#22C55E] font-mono text-xs">Active</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#1F1F1F] bg-[#111111] p-5 text-center">
                <div className="text-[#E53E3E] font-mono text-xs tracking-wider uppercase mb-1">Founded</div>
                <div className="text-white font-bold text-sm">2023</div>
              </div>
              <div className="border border-[#1F1F1F] bg-[#111111] p-5 text-center">
                <div className="text-[#E53E3E] font-mono text-xs tracking-wider uppercase mb-1">Operations</div>
                <div className="text-white font-bold text-sm">Global</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
