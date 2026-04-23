import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from "framer-motion";

type Props = Omit<HTMLMotionProps<"button">, "onPointerMove" | "onPointerLeave" | "style" | "ref" | "children"> & {
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
};

const SPRING = { stiffness: 250, damping: 18, mass: 0.5 };

export default function MagneticButton({ children, variant = "primary", className = "", ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);
  const glareX = useSpring(useMotionValue(50), { stiffness: 200, damping: 20 });
  const glareY = useSpring(useMotionValue(50), { stiffness: 200, damping: 20 });
  const glareOpacity = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });

  const glareBg = useTransform(
    [glareX, glareY] as any,
    ([gx, gy]: [number, number]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 30%, transparent 55%)`
  );

  function handleMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!ref.current || e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    x.set((px - 0.5) * 8);
    y.set((py - 0.5) * 6);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOpacity.set(1);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
    glareOpacity.set(0);
  }

  const baseClass =
    variant === "primary"
      ? "bg-[#E53E3E] text-white hover:bg-[#D53030]"
      : "border border-white/30 text-white hover:border-white/60 hover:bg-white/5";

  return (
    <motion.button
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerUp={handleLeave}
      onPointerCancel={handleLeave}
      onBlur={handleLeave}
      style={{ x, y, willChange: "transform" }}
      className={`relative overflow-hidden font-semibold text-sm rounded-sm transition-colors duration-200 tracking-wide ${baseClass} ${className}`}
      {...(rest as any)}
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: glareOpacity, background: glareBg, mixBlendMode: "overlay" }}
      />
    </motion.button>
  );
}
