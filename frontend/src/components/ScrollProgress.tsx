import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 22,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left pointer-events-none"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, rgba(229,62,62,0) 0%, #E53E3E 35%, #FCA5A5 70%, #E53E3E 100%)",
        boxShadow: "0 0 12px rgba(229,62,62,0.55)",
      }}
    />
  );
}
