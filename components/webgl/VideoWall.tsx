"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FEATURED, type Project } from "@/lib/data";
import { fragmentShader, vertexShader } from "./wallShader";

/* -------------------------------------------------------------------------
   Geometry of the wall

   Planes sit on a concave cylindrical arc so the outer columns lean in toward
   the viewer, the way an IMAX screen wraps. This is the part the CSS mock
   could not do: real Z separation resolved by one camera, so parallax between
   columns is genuine rather than a per-card tilt.
------------------------------------------------------------------------- */

const RADIUS = 6.2;
// Arc spacing must exceed the plane width, or adjacent screens overlap and the
// wall reads as one continuous texture instead of separate frames.
// (2.34 wide + 0.18 gap) / 6.2 radius.
const COLUMN_ANGLE = 0.406;

type Slot = {
  project: Project | null;
  col: number;
  row: number;
  scale: number;
  dim: number;
};

function buildSlots(): Slot[] {
  const slots: Slot[] = [];
  const featured = FEATURED;

  // Main row: the featured reels, centre column first so it reads as the hero.
  featured.slice(0, 5).forEach((project, i) => {
    slots.push({ project, col: i - Math.floor(Math.min(featured.length, 5) / 2), row: 0, scale: 1, dim: 1 });
  });

  // Ambient rows above and below. No project attached — these exist to give
  // the wall edges and depth, and they never take pointer events.
  for (const row of [-1, 1]) {
    for (let col = -2; col <= 2; col++) {
      slots.push({ project: null, col: col + 0.5, row, scale: 0.62, dim: 0.2 });
    }
  }

  return slots;
}

function slotTransform(slot: Slot) {
  const angle = slot.col * COLUMN_ANGLE;
  return {
    position: [
      Math.sin(angle) * RADIUS,
      slot.row * 1.5,
      RADIUS - Math.cos(angle) * RADIUS,
    ] as [number, number, number],
    rotation: [0, -angle, 0] as [number, number, number],
  };
}

/* ------------------------------------------------------------------------- */

function Plane({
  slot,
  index,
  reduced,
  onHover,
}: {
  slot: Slot;
  index: number;
  reduced: boolean;
  onHover: (title: string | null) => void;
}) {
  const router = useRouter();
  const mesh = useRef<THREE.Mesh>(null);
  const life = useRef(0);
  const material = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const { position, rotation } = useMemo(() => slotTransform(slot), [slot]);

  // A real reel becomes a video texture; without one the shader synthesises
  // the frame. Swapping is a data change, not a code change.
  const videoTexture = useMemo(() => {
    const src = slot.project?.reel;
    if (!src || typeof document === "undefined") return null;
    const el = document.createElement("video");
    el.src = src;
    el.loop = true;
    el.muted = true;
    el.playsInline = true;
    el.crossOrigin = "anonymous";
    void el.play().catch(() => {
      /* autoplay refused — the shader still renders a frame underneath */
    });
    const texture = new THREE.VideoTexture(el);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [slot.project?.reel]);

  // Initial uniform values only. Per-frame writes go through the material ref
  // below, NOT through this object — three does not necessarily bind the exact
  // object passed as a prop, so mutating it can silently never reach the GPU.
  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHue: { value: slot.project?.hue ?? (index * 0.137) % 1 },
      uSeed: { value: (index * 0.618) % 1 },
      uFocus: { value: 0 },
      uReveal: { value: 0 },
      uHasMap: { value: videoTexture ? 1 : 0 },
      uMap: { value: videoTexture ?? new THREE.Texture() },
    }),
    // Created once per plane.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoTexture],
  );

  useEffect(() => {
    return () => {
      videoTexture?.image?.pause?.();
      videoTexture?.dispose();
    };
  }, [videoTexture]);

  useFrame((_, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;

    // Own accumulator rather than state.clock: the clock is stopped and reset
    // whenever frameloop toggles for the offscreen pause, so elapsedTime is not
    // a dependable age for the entrance.
    const d = Math.min(delta > 0 ? delta : 1 / 60, 0.05);
    life.current += d;
    u.uTime.value += reduced ? 0 : d;

    if (reduced) {
      // No entrance animation — the wall is simply present.
      u.uReveal.value = slot.dim;
    } else {
      // Staggered entrance — columns resolve outward from the centre.
      const target = Math.min(1, Math.max(0, life.current - index * 0.07 - 0.15));
      u.uReveal.value += (target * slot.dim - u.uReveal.value) * d * 4;
    }

    const focusTarget = hovered ? 1 : 0;
    u.uFocus.value += (focusTarget - u.uFocus.value) * d * 6;

    if (!mesh.current) return;

    // Hovered planes ease toward the camera along their own normal. Because
    // every plane shares one perspective, this reads as depth rather than tilt.
    const lift = u.uFocus.value * 0.22;
    const [x, y, z] = position;
    const angle = slot.col * COLUMN_ANGLE;
    mesh.current.position.set(
      x - Math.sin(angle) * lift,
      y,
      z + Math.cos(angle) * lift,
    );

    // Entrance also travels in Z, so planes arrive from the back of the room.
    const entrance = (1 - Math.min(1, u.uReveal.value / Math.max(slot.dim, 0.001))) * 2.4;
    mesh.current.position.z -= entrance;
  });

  const interactive = Boolean(slot.project);

  return (
    <mesh
      ref={mesh}
      position={position}
      rotation={rotation}
      scale={slot.scale}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        setHovered(true);
        onHover(slot.project!.title);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (!interactive) return;
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={() => {
        if (!interactive) return;
        document.body.style.cursor = "";
        router.push(`/work/${slot.project!.slug}`);
      }}
    >
      <planeGeometry args={[2.34, 1.32]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={initialUniforms}
        transparent={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------------- */

function Rig({ reduced }: { reduced: boolean }) {
  const { camera, pointer } = useThree();
  const base = useRef(new THREE.Vector3(0, 0, 6.4));

  useFrame((_, delta) => {
    if (reduced) {
      camera.position.copy(base.current);
      camera.lookAt(0, 0, 0);
      return;
    }
    const d = Math.min(delta, 0.05);
    // Damped camera dolly. The mock snapped a CSS tilt straight to the cursor,
    // which is what made it feel cheap; easing toward the target is most of
    // the difference between "toy" and "expensive".
    const targetX = base.current.x + pointer.x * 0.85;
    const targetY = base.current.y + pointer.y * 0.5;
    camera.position.x += (targetX - camera.position.x) * d * 2.4;
    camera.position.y += (targetY - camera.position.y) * d * 2.4;
    camera.lookAt(0, 0, 0.4);
  });

  return null;
}

function Scene({
  reduced,
  onHover,
}: {
  reduced: boolean;
  onHover: (title: string | null) => void;
}) {
  const slots = useMemo(buildSlots, []);
  return (
    <>
      <Rig reduced={reduced} />
      {/* Fog starts beyond the nearest planes so only the outer columns fall
          away into black — that falloff is the depth cue. */}
      <fog attach="fog" args={["#000000", 7.2, 14]} />
      {slots.map((slot, i) => (
        <Plane key={i} slot={slot} index={i} reduced={reduced} onHover={onHover} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------------- */

export default function VideoWall() {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Only render frames while the wall is actually on screen. The original
  // polled the DOM on a 700ms interval forever; this costs nothing when idle.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0, 6.4], fov: 42 }}
      >
        <Scene reduced={reduced} onHover={setLabel} />
      </Canvas>

      {label ? (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-mint/30 bg-black/80 px-4 py-2 font-mono text-xs tracking-wide text-mint backdrop-blur">
          {label} — open case study
        </div>
      ) : null}
    </div>
  );
}
