import { Component, type ReactNode, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei";
import * as THREE from "three";

class OrbErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    if (typeof console !== "undefined") console.warn("HeroOrb disabled:", err);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

// Heuristic for "this device probably can't comfortably run a 3D orb."
// Phones, low core counts, low-memory devices, or users who prefer reduced motion all opt out.
function isLowPowerDevice(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
  if (window.matchMedia?.("(max-width: 768px)").matches) return true;
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  return false;
}

function MorphingOrb() {
  const groupRef = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.25;
      wireRef.current.rotation.x = t * 0.12;
      const s = 1 + Math.sin(t * 0.8) * 0.02;
      wireRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner solid morphing orb — segments dropped from 128 to 64 (16K verts → 4K) */}
      <Sphere args={[1.4, 64, 64]}>
        <MeshDistortMaterial
          color="#0F0F0F"
          distort={0.42}
          speed={1.4}
          roughness={0.25}
          metalness={0.85}
          emissive="#E53E3E"
          emissiveIntensity={0.18}
        />
      </Sphere>

      {/* Outer wireframe shell — gives a tech/HUD feel */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.95, 2]} />
        <meshBasicMaterial
          color="#E53E3E"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

function FloatingParticles({ count = 35 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.6 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [count]);

  // Cheap rotation only — no per-vertex updates per frame.
  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.05;
    pointsRef.current.rotation.x = Math.sin(t * 0.3) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#E53E3E"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroOrb() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [inView, setInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLowPowerDevice() || !detectWebGL()) {
      setSupported(false);
      if (typeof console !== "undefined") {
        console.info("Hero orb disabled (low-power device, reduced-motion, or no WebGL).");
      }
      return;
    }
    setSupported(true);
  }, []);

  // Pause rendering when the orb scrolls out of view — frees the GPU for the rest of the page.
  useEffect(() => {
    if (!containerRef.current || !supported) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [supported]);

  if (supported === false || supported === null) {
    return null;
  }

  return (
    <OrbErrorBoundary>
      <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.5]}
          frameloop={inView ? "always" : "never"}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
            stencil: false,
            depth: true,
          }}
          style={{ background: "transparent" }}
          onCreated={(state) => {
            state.gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense fallback={null}>
            {/* Soft ambient base */}
            <ambientLight intensity={0.22} />
            {/* Red rim light from upper-right */}
            <pointLight position={[4, 3, 3]} color="#E53E3E" intensity={3.2} distance={12} decay={1.5} />
            {/* Cool fill from lower-left for depth */}
            <pointLight position={[-4, -2, 2]} color="#3B4A6B" intensity={1.6} distance={10} decay={1.5} />

            <Float
              speed={1.4}
              rotationIntensity={0.25}
              floatIntensity={0.6}
              floatingRange={[-0.08, 0.08]}
            >
              <MorphingOrb />
            </Float>

            <FloatingParticles count={35} />
          </Suspense>
        </Canvas>
      </div>
    </OrbErrorBoundary>
  );
}
