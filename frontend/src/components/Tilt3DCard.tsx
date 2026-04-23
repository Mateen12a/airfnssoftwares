import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
  asChild?: never;
  style?: CSSProperties;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
  "data-testid"?: string;
  "aria-label"?: string;
  initial?: any;
  animate?: any;
  transition?: any;
  as?: "div" | "a" | "article";
}

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

export default function Tilt3DCard({
  children,
  className,
  max = 5,
  glare = true,
  style,
  as = "div",
  ...rest
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);
  const glareX = useSpring(useMotionValue(50), SPRING);
  const glareY = useSpring(useMotionValue(50), SPRING);
  const opacity = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });

  const rotateX = useTransform(y, [-0.5, 0.5], [max, -max]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-max, max]);

  // Hooks must be called unconditionally — keep glare gradient transform here.
  const glareBg = useTransform(
    [glareX, glareY] as any,
    ([gx, gy]: [number, number]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(229,62,62,0.18) 0%, rgba(229,62,62,0.04) 25%, transparent 50%)`
  );

  function handleMove(e: React.PointerEvent) {
    if (!ref.current) return;
    if (e.pointerType !== "mouse") return; // disable on touch
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    x.set(px - 0.5);
    y.set(py - 0.5);
    glareX.set(px * 100);
    glareY.set(py * 100);
    opacity.set(1);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
    opacity.set(0);
  }

  const sharedStyle: any = {
    rotateX,
    rotateY,
    transformStyle: "preserve-3d",
    transformPerspective: 1100,
    willChange: "transform",
    ...style,
  };

  const inner = (
    <>
      {children}
      {glare && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            opacity,
            background: glareBg,
            mixBlendMode: "screen",
          }}
        />
      )}
    </>
  );

  const sharedHandlers = {
    onPointerMove: handleMove,
    onPointerLeave: handleLeave,
    onPointerUp: handleLeave,
    onPointerCancel: handleLeave,
  };

  if (as === "a") {
    return (
      <motion.a
        ref={ref as any}
        {...sharedHandlers}
        style={sharedStyle}
        className={`relative ${className ?? ""}`}
        {...(rest as any)}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.div
      ref={ref as any}
      {...sharedHandlers}
      style={sharedStyle}
      className={`relative ${className ?? ""}`}
      {...(rest as any)}
    >
      {inner}
    </motion.div>
  );
}
