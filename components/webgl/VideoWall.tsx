"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FEATURED, type Project } from "@/lib/data";
import { fragmentShader, vertexShader } from "./wallShader";

/* -------------------------------------------------------------------------
   The hero is an edit bay.

   At rest the wall is a multicam angle grid — one video decode, each plane
   sampling a different cell of a 3x2 contact sheet, so five "cameras" cost
   what one costs. Click any angle and the camera dollies forward until that
   plane fills the frame: no modal, no overlay, the page becomes the cinema.

   Planes sit on a concave cylindrical arc, so the outer columns lean in the
   way an IMAX screen wraps. Real Z separation resolved by one camera — the
   part the CSS mock could not do.
------------------------------------------------------------------------- */

const RADIUS = 6.2;
// Arc spacing must exceed the plane width, or adjacent screens overlap and the
// wall reads as one continuous texture instead of separate frames.
const COLUMN_ANGLE = 0.406;
const PLANE_W = 2.34;
const PLANE_H = 1.32;

/** Contact-sheet layout of the placeholder reel. */
const GRID_COLS = 3;
const GRID_ROWS = 2;
const CELLS = GRID_COLS * GRID_ROWS;

export const REEL_SRC = "/reels/showreel-multicam.mp4";

type Slot = {
  project: Project | null;
  col: number;
  row: number;
  scale: number;
  dim: number;
  /** Which contact-sheet cell this plane shows. */
  cell: number;
  /** Label shown in the HUD, e.g. "A1". */
  angle: string;
};

function buildSlots(): Slot[] {
  const slots: Slot[] = [];
  const featured = FEATURED.slice(0, 5);

  featured.forEach((project, i) => {
    slots.push({
      project,
      col: i - Math.floor(featured.length / 2),
      row: 0,
      scale: 1,
      dim: 1,
      cell: i % CELLS,
      angle: `A${i + 1}`,
    });
  });

  // Ambient rows give the wall edges and depth. Never interactive.
  for (const row of [-1, 1]) {
    for (let col = -2; col <= 2; col++) {
      const i = slots.length;
      slots.push({
        project: null,
        col: col + 0.5,
        row,
        scale: 0.62,
        dim: 0.2,
        cell: i % CELLS,
        angle: "",
      });
    }
  }

  return slots;
}

function slotPosition(slot: Slot): [number, number, number] {
  const a = slot.col * COLUMN_ANGLE;
  return [Math.sin(a) * RADIUS, slot.row * 1.5, RADIUS - Math.cos(a) * RADIUS];
}

/** Outward normal of a plane on the concave arc. */
function slotNormal(slot: Slot): THREE.Vector3 {
  const a = slot.col * COLUMN_ANGLE;
  return new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
}

function cellUV(cell: number): [number, number, number, number] {
  const col = cell % GRID_COLS;
  const row = Math.floor(cell / GRID_COLS);
  // VideoTexture is flipY, so uv.y = 1 is the top of the sheet.
  return [col / GRID_COLS, 1 - (row + 1) / GRID_ROWS, 1 / GRID_COLS, 1 / GRID_ROWS];
}

/* ------------------------------------------------------------------------- */

function Plane({
  slot,
  index,
  reduced,
  texture,
  focused,
  anyFocused,
  onHover,
  onSelect,
}: {
  slot: Slot;
  index: number;
  reduced: boolean;
  texture: THREE.VideoTexture | null;
  focused: boolean;
  anyFocused: boolean;
  onHover: (slot: Slot | null) => void;
  onSelect: (index: number) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const life = useRef(0);
  const [hovered, setHovered] = useState(false);

  const position = useMemo(() => slotPosition(slot), [slot]);
  const rotation = useMemo<[number, number, number]>(
    () => [0, -slot.col * COLUMN_ANGLE, 0],
    [slot],
  );

  // Initial values only. Per-frame writes go through the material ref below —
  // three does not necessarily bind the exact object passed as a prop, so
  // mutating it can silently never reach the GPU.
  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHue: { value: slot.project?.hue ?? (index * 0.137) % 1 },
      uSeed: { value: (index * 0.618) % 1 },
      uFocus: { value: 0 },
      uReveal: { value: 0 },
      uHasMap: { value: 0 },
      uMap: { value: texture ?? new THREE.Texture() },
      uCell: { value: new THREE.Vector4(...cellUV(slot.cell)) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const u = material.current?.uniforms;
    if (!u || !texture) return;
    u.uMap.value = texture;
    u.uHasMap.value = 1;
  }, [texture]);

  useFrame((_, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;

    const d = Math.min(delta > 0 ? delta : 1 / 60, 0.05);
    life.current += d;
    u.uTime.value += reduced ? 0 : d;

    // While one angle is promoted, the rest fall away rather than compete.
    const dimTarget = anyFocused ? (focused ? 1 : 0.06) : slot.dim;

    if (reduced) {
      u.uReveal.value = dimTarget;
    } else {
      const entrance = Math.min(1, Math.max(0, life.current - index * 0.07 - 0.15));
      u.uReveal.value += (entrance * dimTarget - u.uReveal.value) * d * 4;
    }

    const focusTarget = focused ? 1 : hovered && !anyFocused ? 1 : 0;
    u.uFocus.value += (focusTarget - u.uFocus.value) * d * 6;

    if (!mesh.current) return;

    // Hovered planes ease toward the camera along their own normal. Because
    // every plane shares one perspective, this reads as depth, not tilt.
    const lift = anyFocused ? 0 : u.uFocus.value * 0.22;
    const n = slotNormal(slot);
    const [x, y, z] = position;
    mesh.current.position.set(x + n.x * lift, y, z + n.z * lift);

    // Unfocused planes retreat while cinema is open.
    const retreat = anyFocused && !focused ? 1.6 : 0;
    const enter =
      (1 - Math.min(1, u.uReveal.value / Math.max(dimTarget, 0.001))) * 2.4;
    mesh.current.position.z -= enter + retreat;
  });

  const interactive = Boolean(slot.project);

  return (
    <mesh
      ref={mesh}
      position={position}
      rotation={rotation}
      scale={slot.scale}
      onPointerOver={(e) => {
        if (!interactive || anyFocused) return;
        e.stopPropagation();
        setHovered(true);
        onHover(slot);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (!interactive) return;
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        if (!interactive || anyFocused) return;
        e.stopPropagation();
        document.body.style.cursor = "";
        onSelect(index);
      }}
    >
      <planeGeometry args={[PLANE_W, PLANE_H]} />
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

function Rig({
  reduced,
  focusSlot,
}: {
  reduced: boolean;
  focusSlot: Slot | null;
}) {
  const { camera, pointer, size } = useThree();
  const lookAt = useRef(new THREE.Vector3(0, 0, 0.4));

  useFrame((_, delta) => {
    const d = Math.min(delta > 0 ? delta : 1 / 60, 0.05);
    const cam = camera as THREE.PerspectiveCamera;

    if (focusSlot) {
      // Dolly to a square-on position far enough back that the plane is
      // fully contained — whichever of width/height binds at this aspect.
      const half = THREE.MathUtils.degToRad(cam.fov) / 2;
      const aspect = size.width / size.height;
      const fitH = PLANE_H / 2 / Math.tan(half);
      const fitW = PLANE_W / 2 / (Math.tan(half) * aspect);
      const dist = Math.max(fitH, fitW) * 1.06;

      const p = slotPosition(focusSlot);
      const n = slotNormal(focusSlot);
      const target = new THREE.Vector3(
        p[0] + n.x * dist,
        p[1] + n.y * dist,
        p[2] + n.z * dist,
      );
      const aim = new THREE.Vector3(p[0], p[1], p[2]);

      const k = reduced ? 1 : Math.min(1, d * 3.2);
      camera.position.lerp(target, k);
      lookAt.current.lerp(aim, k);
      camera.lookAt(lookAt.current);
      return;
    }

    const rest = new THREE.Vector3(
      reduced ? 0 : pointer.x * 0.85,
      reduced ? 0 : pointer.y * 0.5,
      6.4,
    );
    const k = reduced ? 1 : Math.min(1, d * 2.4);
    camera.position.lerp(rest, k);
    lookAt.current.lerp(new THREE.Vector3(0, 0, 0.4), k);
    camera.lookAt(lookAt.current);
  });

  return null;
}

function Scene({
  reduced,
  texture,
  slots,
  focus,
  onHover,
  onSelect,
}: {
  reduced: boolean;
  texture: THREE.VideoTexture | null;
  slots: Slot[];
  focus: number | null;
  onHover: (slot: Slot | null) => void;
  onSelect: (index: number) => void;
}) {
  return (
    <>
      <Rig reduced={reduced} focusSlot={focus === null ? null : slots[focus]} />
      {/* Fog starts beyond the nearest planes so only the outer columns fall
          away into black — that falloff is the depth cue. */}
      <fog attach="fog" args={["#000000", 7.2, 14]} />
      {slots.map((slot, i) => (
        <Plane
          key={i}
          slot={slot}
          index={i}
          reduced={reduced}
          texture={texture}
          focused={focus === i}
          anyFocused={focus !== null}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------------- */

function timecode(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * 24);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
}

export default function VideoWall({
  onCinemaChange,
}: {
  onCinemaChange?: (open: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();

  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  const [hover, setHover] = useState<Slot | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const slots = useMemo(buildSlots, []);
  const focusSlot = focus === null ? null : slots[focus];

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  // One video element for the whole wall.
  useEffect(() => {
    const el = document.createElement("video");
    el.src = REEL_SRC;
    el.loop = true;
    el.muted = true;
    el.playsInline = true;
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    video.current = el;

    const tex = new THREE.VideoTexture(el);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const onMeta = () => setDuration(el.duration || 0);
    el.addEventListener("loadedmetadata", onMeta);
    void el.play().catch(() => {
      /* autoplay refused — the shader still renders a synthesised frame */
    });
    setTexture(tex);

    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.pause();
      el.removeAttribute("src");
      el.load();
      tex.dispose();
    };
  }, []);

  // Render frames only while the wall is on screen.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause decoding entirely when off screen — a hero video should not cost
  // anything once the visitor has scrolled past it.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (active) void el.play().catch(() => {});
    else el.pause();
  }, [active]);

  const exit = useCallback(() => {
    setFocus(null);
    setMuted(true);
    const el = video.current;
    if (el) el.muted = true;
  }, []);

  const enter = useCallback((i: number) => {
    setFocus(i);
    setHover(null);
    // The click is the user gesture, so unmuting here is permitted.
    const el = video.current;
    if (el) {
      el.muted = false;
      void el.play().catch(() => {});
    }
    setMuted(false);
  }, []);

  useEffect(() => {
    const open = focus !== null;
    onCinemaChange?.(open);
    document.body.style.overflow = open ? "hidden" : "";
    // Header and scroll rail hide via CSS on this class — the page becomes the
    // cinema, so the chrome has to leave rather than float over the picture.
    document.documentElement.classList.toggle("cinema-open", open);
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("cinema-open");
    };
  }, [focus, onCinemaChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exit]);

  // Drive the HUD clock only while cinema is open.
  useEffect(() => {
    if (focus === null) return;
    let raf = 0;
    const tick = () => {
      const el = video.current;
      if (el) setTime(el.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [focus]);

  return (
    <div ref={host} className="absolute inset-0">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0, 6.4], fov: 42 }}
      >
        <Scene
          reduced={reduced}
          texture={texture}
          slots={slots}
          focus={focus}
          onHover={setHover}
          onSelect={enter}
        />
      </Canvas>

      {/* ── Rest state: multicam bay HUD ── */}
      {focus === null ? (
        <>
          <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2.5 sm:left-8 sm:top-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              Multicam · 5 angles live
            </span>
          </div>

          <div
            className={`pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border px-4 py-2 font-mono text-xs backdrop-blur transition-opacity duration-300 ${
              hover
                ? "border-mint/40 bg-black/80 text-mint opacity-100"
                : "border-white/12 bg-black/60 text-white/45 opacity-100"
            }`}
          >
            {hover
              ? `${hover.angle} · ${hover.project?.title} — click to view`
              : "Click any angle to watch the reel"}
          </div>
        </>
      ) : null}

      {/* ── Cinema HUD ── */}
      {focusSlot ? (
        <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-md border border-mint/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-mint backdrop-blur">
                {focusSlot.angle} · Program
              </span>
              <span className="hidden font-mono text-[11px] text-white/50 sm:inline">
                {focusSlot.project?.title}
              </span>
            </div>

            <button
              type="button"
              onClick={exit}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur transition-colors hover:border-mint/50 hover:text-mint"
              aria-label="Close the reel"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-mint">{timecode(time)}</span>

              <div className="relative flex-1">
                <div className="h-1 overflow-hidden rounded-full bg-white/15">
                  <span
                    className="block h-full rounded-full bg-mint"
                    style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration, 0.1)}
                  step={0.01}
                  value={time}
                  onChange={(e) => {
                    const el = video.current;
                    if (el) el.currentTime = Number(e.target.value);
                  }}
                  aria-label="Scrub the reel"
                  className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
                />
              </div>

              <span className="font-mono text-xs text-white/40">
                {timecode(duration)}
              </span>

              <button
                type="button"
                onClick={() => {
                  const el = video.current;
                  if (!el) return;
                  el.muted = !el.muted;
                  setMuted(el.muted);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur transition-colors hover:border-mint/50 hover:text-mint"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 9v6h4l5 4V5L8 9H4zM17 9l4 6M21 9l-4 6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 9v6h4l5 4V5L8 9H4zM17 8.5a4.5 4.5 0 0 1 0 7"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
                Placeholder reel · press esc to exit
              </span>
              {focusSlot.project ? (
                <button
                  type="button"
                  onClick={() => {
                    exit();
                    router.push(`/work/${focusSlot.project!.slug}`);
                  }}
                  className="rounded-full bg-mint px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-mint-bright"
                >
                  Read the case study →
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
