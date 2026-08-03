"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { cloudFragment, cloudVertex } from "./cloudShader";

/**
 * The cloud bank the hero reel sits on.
 *
 * One fullscreen quad, one shader, no geometry — cheap enough to run behind a
 * playing video. Scroll progress drives `uDissipate`, so the bank clears as
 * you move down rather than simply fading.
 */

function Clouds({ progress, reduced }: { progress: number; reduced: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uDissipate: { value: 0 },
    }),
    [],
  );

  useFrame((_, delta) => {
    // Uniforms are written through the material ref, not the prop object:
    // three does not necessarily bind the exact object passed as `uniforms`.
    const u = material.current?.uniforms;
    if (!u) return;
    const d = Math.min(delta > 0 ? delta : 1 / 60, 0.05);
    if (!reduced) u.uTime.value += d;
    u.uAspect.value = size.width / Math.max(size.height, 1);
    // Ease toward the scroll target so a flicked wheel does not snap the bank.
    u.uDissipate.value += (progress - u.uDissipate.value) * Math.min(1, d * 6);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={cloudVertex}
        fragmentShader={cloudFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function CloudField({ progress }: { progress: number }) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <Clouds progress={progress} reduced={reduced} />
      </Canvas>
    </div>
  );
}
