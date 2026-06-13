"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

const MILK = "#fbfaf5";

function milkMat() {
  return <meshStandardMaterial color={MILK} roughness={0.3} emissive="#ffffff" emissiveIntensity={0.12} />;
}

function Jug() {
  return (
    <group position={[-0.55, 1.05, 0]} rotation={[0, 0, -1.9]}>
      {/* body */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.42, 1.05, 24]} />
        {milkMat()}
      </mesh>
      {/* spout */}
      <mesh position={[0, 0.58, 0]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.17, 0.24, 0.42, 16]} />
        {milkMat()}
      </mesh>
      {/* handle */}
      <mesh position={[-0.55, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.06, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#eee6d2" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Stream() {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.x = Math.sin(t * 3) * 0.025;
      ref.current.scale.x = 1 + Math.sin(t * 9) * 0.14;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.07, 0.09, 1.75, 12]} />
      {milkMat()}
    </mesh>
  );
}

function Droplet({ delay }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() + delay) % 1.1;
    if (!ref.current) return;
    ref.current.position.set(0, 0.95 - t * 1.75, 0);
    const s = t < 0.9 ? 0.07 : Math.max(0.001, 0.07 * (1 - (t - 0.9) / 0.2));
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 8, 8]} />
      {milkMat()}
    </mesh>
  );
}

function Pool() {
  return (
    <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.05, 1.05, 0.12, 36]} />
      {milkMat()}
    </mesh>
  );
}

function Ripple({ delay }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() + delay) % 2;
    if (!ref.current) return;
    const s = 0.3 + t * 0.45;
    ref.current.scale.set(s, s, 1);
    ref.current.material.opacity = Math.max(0, 0.45 * (1 - t / 2));
  });
  return (
    <mesh ref={ref} position={[0, -0.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1, 0.045, 8, 40]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.4} roughness={0.3} />
    </mesh>
  );
}

function MilkScene() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[2, 4, 3]} intensity={1.1} />
      <Jug />
      <Stream />
      {[0, 0.37, 0.74].map((d, i) => (
        <Droplet key={i} delay={d} />
      ))}
      <Pool />
      {[0, 0.7, 1.4].map((d, i) => (
        <Ripple key={i} delay={d} />
      ))}
    </>
  );
}

export default function MilkPour3D() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="mx-auto mt-8 h-40 w-full max-w-[260px]" aria-hidden />;
  return (
    <div className="pointer-events-none mx-auto mt-8 h-40 w-full max-w-[260px]">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.05, 4.6], fov: 42 }} gl={{ alpha: true }}>
        <MilkScene />
      </Canvas>
    </div>
  );
}
