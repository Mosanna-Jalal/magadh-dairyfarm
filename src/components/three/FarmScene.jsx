"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Sky } from "@react-three/drei";

// Deterministic pseudo-random so positions are stable across renders
const rnd = (i, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Cow({ position = [0, 0, 0], rotation = [0, 0, 0], body = "#f5efe2", spots = "#6b4a2f", phase = 0, scale = 1 }) {
  const head = useRef();
  const tail = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    if (head.current) head.current.rotation.x = 0.35 + Math.sin(t * 0.6) * 0.35; // grazing bob
    if (tail.current) tail.current.rotation.z = Math.sin(t * 2.2) * 0.35; // tail swish
  });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* body */}
      <RoundedBox args={[1.9, 1.05, 1.0]} radius={0.3} position={[0, 1.05, 0]} castShadow>
        <meshStandardMaterial color={body} roughness={0.9} />
      </RoundedBox>
      {/* spots */}
      {[[-0.45, 1.25, 0.45], [0.4, 0.95, 0.48], [0.1, 1.3, -0.47], [-0.5, 0.9, -0.45]].map((p, i) => (
        <mesh key={i} position={p} scale={[0.32 + rnd(i, 5) * 0.15, 0.22, 0.08]} castShadow={false}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={spots} roughness={1} />
        </mesh>
      ))}
      {/* head group (animated graze) */}
      <group ref={head} position={[1.05, 1.35, 0]}>
        <RoundedBox args={[0.55, 0.5, 0.45]} radius={0.12} position={[0.18, -0.05, 0]} castShadow>
          <meshStandardMaterial color={body} roughness={0.9} />
        </RoundedBox>
        {/* snout */}
        <RoundedBox args={[0.22, 0.26, 0.34]} radius={0.08} position={[0.48, -0.16, 0]} castShadow>
          <meshStandardMaterial color="#e8b9a8" roughness={0.8} />
        </RoundedBox>
        {/* eyes */}
        {[0.2, -0.2].map((z, i) => (
          <mesh key={i} position={[0.36, 0.06, z]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#241a12" />
          </mesh>
        ))}
        {/* ears */}
        {[0.28, -0.28].map((z, i) => (
          <mesh key={i} position={[0.05, 0.12, z]} rotation={[0, 0, -0.4]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial color={body} roughness={0.9} />
          </mesh>
        ))}
        {/* horns */}
        {[0.16, -0.16].map((z, i) => (
          <mesh key={i} position={[0.05, 0.3, z]} rotation={[z > 0 ? -0.5 : 0.5, 0, -0.3]}>
            <coneGeometry args={[0.05, 0.22, 8]} />
            <meshStandardMaterial color="#d9cdb8" roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* legs */}
      {[[0.65, 0.45], [0.65, -0.45], [-0.65, 0.45], [-0.65, -0.45]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z * 0.75]} castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.75, 10]} />
          <meshStandardMaterial color={body} roughness={0.95} />
        </mesh>
      ))}
      {/* udder */}
      <mesh position={[-0.35, 0.55, 0]} scale={[1, 0.8, 1]}>
        <sphereGeometry args={[0.26, 12, 12]} />
        <meshStandardMaterial color="#f0b7a6" roughness={0.7} />
      </mesh>
      {/* tail */}
      <group ref={tail} position={[-0.95, 1.45, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.035, 0.03, 0.8, 6]} />
          <meshStandardMaterial color={body} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={spots} roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

function Buffalo({ position = [0, 0, 0], rotation = [0, 0, 0], phase = 0, scale = 1.1 }) {
  const head = useRef();
  const tail = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    if (head.current) head.current.rotation.x = 0.25 + Math.sin(t * 0.5) * 0.3;
    if (tail.current) tail.current.rotation.z = Math.sin(t * 1.8) * 0.3;
  });
  const dark = "#34343c";
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[2.0, 1.15, 1.1]} radius={0.32} position={[0, 1.1, 0]} castShadow>
        <meshStandardMaterial color={dark} roughness={0.85} />
      </RoundedBox>
      <group ref={head} position={[1.1, 1.4, 0]}>
        <RoundedBox args={[0.6, 0.52, 0.5]} radius={0.14} position={[0.18, -0.05, 0]} castShadow>
          <meshStandardMaterial color={dark} roughness={0.85} />
        </RoundedBox>
        <RoundedBox args={[0.24, 0.28, 0.38]} radius={0.08} position={[0.5, -0.16, 0]} castShadow>
          <meshStandardMaterial color="#23232a" roughness={0.8} />
        </RoundedBox>
        {[0.22, -0.22].map((z, i) => (
          <mesh key={i} position={[0.38, 0.08, z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#0d0d10" />
          </mesh>
        ))}
        {/* swept-back curved horns */}
        {[0.25, -0.25].map((z, i) => (
          <mesh key={i} position={[-0.05, 0.28, z]} rotation={[z > 0 ? Math.PI / 2.4 : -Math.PI / 2.4, 0.4, 0]}>
            <torusGeometry args={[0.3, 0.05, 8, 20, Math.PI * 0.85]} />
            <meshStandardMaterial color="#b8aa92" roughness={0.5} />
          </mesh>
        ))}
        {[0.3, -0.3].map((z, i) => (
          <mesh key={i} position={[0.02, 0.1, z]} rotation={[0, 0, -0.5]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={dark} roughness={0.9} />
          </mesh>
        ))}
      </group>
      {[[0.7, 0.45], [0.7, -0.45], [-0.7, 0.45], [-0.7, -0.45]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z * 0.8]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 0.75, 10]} />
          <meshStandardMaterial color={dark} roughness={0.95} />
        </mesh>
      ))}
      <group ref={tail} position={[-1.0, 1.5, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.85, 6]} />
          <meshStandardMaterial color={dark} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.88, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#16161a" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

function MilkCan({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.42, 1.0, 20]} />
        <meshStandardMaterial color="#c8d2da" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.34, 0.25, 20]} />
        <meshStandardMaterial color="#c8d2da" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.23, 0.12, 20]} />
        <meshStandardMaterial color="#aeb9c2" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.38, 0]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#aeb9c2" metalness={0.8} roughness={0.25} />
      </mesh>
      {[0.4, -0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.85, 0]} rotation={[0, 0, x > 0 ? -0.4 : 0.4]}>
          <torusGeometry args={[0.12, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#aeb9c2" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Barn({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[5, 3, 3.6]} />
        <meshStandardMaterial color="#b34a3e" roughness={0.85} />
      </mesh>
      {/* gable roof from two slanted panels */}
      <mesh position={[0, 3.55, 1.0]} rotation={[Math.PI / 5.2, 0, 0]} castShadow>
        <boxGeometry args={[5.4, 0.16, 2.45]} />
        <meshStandardMaterial color="#75352c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.55, -1.0]} rotation={[-Math.PI / 5.2, 0, 0]} castShadow>
        <boxGeometry args={[5.4, 0.16, 2.45]} />
        <meshStandardMaterial color="#75352c" roughness={0.9} />
      </mesh>
      {/* gable end */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[1.45, 1.45, 4.9, 3, 1]} />
        <meshStandardMaterial color="#a8453a" roughness={0.85} visible={false} />
      </mesh>
      {/* door */}
      <mesh position={[2.51, 1.1, 0]}>
        <boxGeometry args={[0.05, 2.0, 1.7]} />
        <meshStandardMaterial color="#f2e6d4" roughness={0.8} />
      </mesh>
      {/* X braces on the door */}
      {[0.6, -0.6].map((r, i) => (
        <mesh key={i} position={[2.55, 1.1, 0]} rotation={[r, 0, 0]}>
          <boxGeometry args={[0.04, 2.2, 0.16]} />
          <meshStandardMaterial color="#b34a3e" roughness={0.85} />
        </mesh>
      ))}
      {/* loft window */}
      <mesh position={[2.51, 2.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 16]} />
        <meshStandardMaterial color="#f2e6d4" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Tree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.4, 8]} />
        <meshStandardMaterial color="#6e4a2e" roughness={1} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.85, 14, 14]} />
        <meshStandardMaterial color="#3e7c3f" roughness={0.95} />
      </mesh>
      <mesh position={[0.5, 1.45, 0.25]} castShadow>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#4a8c48" roughness={0.95} />
      </mesh>
      <mesh position={[-0.45, 1.5, -0.2]} castShadow>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color="#357036" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Windmill({ position = [0, 0, 0] }) {
  const blades = useRef();
  useFrame((_, delta) => {
    if (blades.current) blades.current.rotation.z += delta * 1.2;
  });
  return (
    <group position={position}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.22, 4.4, 8]} />
        <meshStandardMaterial color="#9aa3ab" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.4, 0.15]}>
        <boxGeometry args={[0.3, 0.3, 0.4]} />
        <meshStandardMaterial color="#7d8790" metalness={0.5} roughness={0.4} />
      </mesh>
      <group ref={blades} position={[0, 4.4, 0.42]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0]}>
            <boxGeometry args={[0.14, 1.7, 0.04]} />
            <meshStandardMaterial color="#e8e4da" roughness={0.6} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#5d666e" metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function FenceRun({ start = [0, 0, 0], count = 5, gap = 1.1, rotation = [0, 0, 0] }) {
  return (
    <group position={start} rotation={rotation}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[i * gap, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.9, 6]} />
          <meshStandardMaterial color="#8a6844" roughness={1} />
        </mesh>
      ))}
      {[0.62, 0.3].map((y, i) => (
        <mesh key={i} position={[((count - 1) * gap) / 2, y, 0]}>
          <boxGeometry args={[(count - 1) * gap + 0.3, 0.07, 0.04]} />
          <meshStandardMaterial color="#9a7850" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Cloud({ position = [0, 0, 0], scale = 1, speed = 0.15 }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.x += delta * speed;
    if (ref.current.position.x > 24) ref.current.position.x = -24;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      {[[0, 0, 0, 1.1], [0.9, 0.18, 0.2, 0.8], [-0.9, 0.12, -0.1, 0.75], [0.3, 0.45, -0.2, 0.7]].map(
        ([x, y, z, s], i) => (
          <mesh key={i} position={[x, y, z]} scale={s}>
            <sphereGeometry args={[0.8, 12, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.92} />
          </mesh>
        )
      )}
    </group>
  );
}

function GrassTufts({ count = 50 }) {
  const tufts = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const a = rnd(i, 1) * Math.PI * 2;
        const r = 4 + rnd(i, 2) * 16;
        return {
          pos: [Math.cos(a) * r, 0.12, Math.sin(a) * r],
          s: 0.5 + rnd(i, 3) * 0.8,
          c: rnd(i, 4) > 0.5 ? "#5d9b4d" : "#4d8a42",
        };
      }),
    [count]
  );
  return tufts.map((t, i) => (
    <mesh key={i} position={t.pos} scale={t.s}>
      <coneGeometry args={[0.12, 0.3, 5]} />
      <meshStandardMaterial color={t.c} roughness={1} />
    </mesh>
  ));
}

// Drives the intro zoom: while `active`, dollies the camera from a close-up
// (progress 0) out to the full farm (progress 1), with a gentle auto-rotate.
function CameraRig({ progressRef, active }) {
  const { camera } = useThree();
  useFrame((state) => {
    if (!active) return; // handed off to OrbitControls
    const raw = progressRef && progressRef.current ? progressRef.current.value : 0;
    const p = Math.min(1, Math.max(0, raw));
    const e = p * p * (3 - 2 * p); // smoothstep
    const radius = 6.6 + (14 - 6.6) * e;
    const polar = 0.95; // fixed viewing tilt
    const t = state.clock.getElapsedTime();
    const az = 0.6 + t * 0.08; // slow drift while zooming
    const horiz = Math.sin(polar) * radius;
    camera.position.set(Math.cos(az) * horiz, 1.2 + Math.cos(polar) * radius, Math.sin(az) * horiz);
    camera.lookAt(0, 1.2, 0);
  });
  return null;
}

function FarmWorld({ progressRef, locked }) {
  return (
    <>
      <Sky sunPosition={[60, 28, 40]} turbidity={5} rayleigh={1.2} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#cfe8ff", "#5d8a4a", 0.45]} />
      <directionalLight
        position={[10, 14, 7]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[34, 48]} />
        <meshStandardMaterial color="#6fa55c" roughness={1} />
      </mesh>
      <GrassTufts />

      <Barn position={[-5.5, 0, -4.5]} rotation={[0, 0.7, 0]} />
      <Windmill position={[-9, 0, 1.5]} />

      {/* the herd */}
      <Cow position={[1.2, 0, 1.6]} rotation={[0, -0.7, 0]} phase={0} />
      <Cow position={[-1.8, 0, 3.4]} rotation={[0, 0.4, 0]} body="#caa27a" spots="#8a6240" phase={2.1} scale={0.9} />
      <Cow position={[4.2, 0, -1.4]} rotation={[0, -2.1, 0]} phase={4.2} scale={0.95} />
      <Buffalo position={[-3.2, 0, -0.8]} rotation={[0, 0.9, 0]} phase={1.3} />
      <Buffalo position={[2.4, 0, -4.4]} rotation={[0, 2.6, 0]} phase={3.4} scale={1.0} />
      {/* calf */}
      <Cow position={[2.6, 0, 3.6]} rotation={[0, -1.2, 0]} phase={5.3} scale={0.55} />

      {/* milk cans near the barn */}
      <MilkCan position={[-3.2, 0, -3.4]} scale={0.9} />
      <MilkCan position={[-2.4, 0, -3.8]} scale={0.75} />
      <MilkCan position={[-2.8, 0, -2.7]} scale={0.6} />

      <Tree position={[7.5, 0, -5.5]} scale={1.5} />
      <Tree position={[9.5, 0, 1.5]} scale={1.1} />
      <Tree position={[-9.5, 0, -7.5]} scale={1.3} />
      <Tree position={[6.0, 0, 6.0]} scale={0.9} />
      <Tree position={[-7.0, 0, 6.5]} scale={1.2} />

      <FenceRun start={[3.8, 0, 5.6]} count={6} rotation={[0, 0.5, 0]} />
      <FenceRun start={[-8.6, 0, 4.2]} count={6} rotation={[0, -0.4, 0]} />

      <Cloud position={[-10, 9, -6]} scale={1.6} speed={0.18} />
      <Cloud position={[4, 10.5, -10]} scale={2.1} speed={0.12} />
      <Cloud position={[12, 8.5, -2]} scale={1.2} speed={0.22} />

      <CameraRig progressRef={progressRef} active={locked} />
      {!locked && (
        <OrbitControls
          makeDefault
          target={[0, 1.2, 0]}
          autoRotate
          autoRotateSpeed={0.6}
          enablePan={false}
          enableZoom={false}
          minDistance={7}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.08}
        />
      )}
    </>
  );
}

export default function FarmScene({ progressRef, locked = false }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [5.2, 3.2, 3.6], fov: 42 }}
      className="!absolute inset-0"
    >
      <FarmWorld progressRef={progressRef} locked={locked} />
    </Canvas>
  );
}
