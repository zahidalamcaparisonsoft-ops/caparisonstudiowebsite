"use client";

import { useId, useMemo, useState } from "react";

/**
 * Audience-retention curve, before and after the re-cut.
 *
 * Before/after is ORDINAL — swapping the two would change the meaning — so it
 * takes a one-hue ramp rather than two categorical hues. Steps are dim→bright
 * mint: lightness is monotonic, CVD separation ΔE 31.7, both pass 3:1 against
 * the surface. Dash pattern and direct labels carry identity as well as colour.
 */

const BEFORE = "#35836D";
const AFTER = "#4DF5C6";

const W = 720;
const H = 300;
const PAD = { top: 22, right: 92, bottom: 40, left: 46 };

type Props = {
  before: number[];
  after: number[];
  className?: string;
};

export default function RetentionChart({ before, after, className = "" }: Props) {
  const uid = useId();
  const [hover, setHover] = useState<number | null>(null);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (i: number, n: number) => PAD.left + (i / (n - 1)) * plotW;
  const y = (v: number) => PAD.top + (1 - v) * plotH;

  const path = (series: number[]) =>
    series.map((v, i) => `${i === 0 ? "M" : "L"}${x(i, series.length)},${y(v)}`).join(" ");

  const areaPath = useMemo(() => {
    const line = after
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(i, after.length)},${y(v)}`)
      .join(" ");
    return `${line} L${x(after.length - 1, after.length)},${y(0)} L${x(0, after.length)},${y(0)} Z`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [after]);

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <figure className={`m-0 ${className}`}>
      <figcaption className="mb-4">
        <h3 className="font-display text-lg font-bold text-white">
          Audience retention
        </h3>
        <p className="mt-1 text-sm text-white/50">
          Share of viewers still watching, across the length of the video.
        </p>
      </figcaption>

      {/* Legend — always present for two series. */}
      <div className="mb-3 flex flex-wrap items-center gap-5">
        {[
          { label: "Before", color: BEFORE, dash: true },
          { label: "After our cut", color: AFTER, dash: false },
        ].map((s) => (
          <span key={s.label} className="flex items-center gap-2">
            <svg width="20" height="8" aria-hidden="true">
              <line
                x1="0"
                y1="4"
                x2="20"
                y2="4"
                stroke={s.color}
                strokeWidth="2"
                strokeDasharray={s.dash ? "5 3" : undefined}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm text-white/70">{s.label}</span>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[520px]"
          role="img"
          aria-label="Line chart comparing audience retention before and after the re-cut. Retention is higher across the entire video after the re-cut."
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={AFTER} stopOpacity="0.22" />
              <stop offset="100%" stopColor={AFTER} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Recessive grid */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                y1={y(t)}
                x2={W - PAD.right}
                y2={y(t)}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 10}
                y={y(t)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.38)"
                fontSize="11"
                fontFamily="var(--font-mono)"
              >
                {Math.round(t * 100)}%
              </text>
            </g>
          ))}

          {/* x axis */}
          <line
            x1={PAD.left}
            y1={y(0)}
            x2={W - PAD.right}
            y2={y(0)}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1"
          />
          {[0, 0.5, 1].map((t) => (
            <text
              key={t}
              x={PAD.left + t * plotW}
              y={H - PAD.bottom + 20}
              textAnchor={t === 0 ? "start" : t === 1 ? "end" : "middle"}
              fill="rgba(255,255,255,0.38)"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {t === 0 ? "Start" : t === 1 ? "End" : "Halfway"}
            </text>
          ))}

          <path d={areaPath} fill={`url(#${uid}-fill)`} />

          <path
            d={path(before)}
            fill="none"
            stroke={BEFORE}
            strokeWidth="2"
            strokeDasharray="5 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path(after)}
            fill="none"
            stroke={AFTER}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Direct labels at the series ends — identity without relying on colour. */}
          <text
            x={W - PAD.right + 10}
            y={y(after[after.length - 1])}
            dominantBaseline="middle"
            fill={AFTER}
            fontSize="12"
            fontWeight="700"
          >
            After
          </text>
          <text
            x={W - PAD.right + 10}
            y={y(before[before.length - 1])}
            dominantBaseline="middle"
            fill={BEFORE}
            fontSize="12"
            fontWeight="700"
          >
            Before
          </text>

          {/* Hover layer */}
          {hover !== null ? (
            <g pointerEvents="none">
              <line
                x1={x(hover, after.length)}
                y1={PAD.top}
                x2={x(hover, after.length)}
                y2={y(0)}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1"
              />
              <circle
                cx={x(hover, before.length)}
                cy={y(before[hover])}
                r="5"
                fill={BEFORE}
                stroke="#050807"
                strokeWidth="2"
              />
              <circle
                cx={x(hover, after.length)}
                cy={y(after[hover])}
                r="5"
                fill={AFTER}
                stroke="#050807"
                strokeWidth="2"
              />
            </g>
          ) : null}

          {/* Generous hit targets */}
          {after.map((_, i) => (
            <rect
              key={i}
              x={x(i, after.length) - plotW / (after.length - 1) / 2}
              y={PAD.top}
              width={plotW / (after.length - 1)}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
      </div>

      {hover !== null ? (
        <p className="mt-3 font-mono text-xs text-white/70">
          At {hover * 10}% through: {Math.round(before[hover] * 100)}% before ·{" "}
          <span className="text-mint-bright">
            {Math.round(after[hover] * 100)}% after
          </span>
        </p>
      ) : (
        <p className="mt-3 font-mono text-xs text-white/35">
          Hover the chart for values at any point.
        </p>
      )}

      {/* Table view — the same data, readable without colour or a pointer. */}
      <details className="mt-4">
        <summary className="cursor-pointer text-xs text-white/45 hover:text-white/70">
          View as table
        </summary>
        <table className="mt-3 w-full border-collapse text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-white/12 text-white/50">
              <th scope="col" className="py-2 pr-4 font-normal">
                Through
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                Before
              </th>
              <th scope="col" className="py-2 font-normal">
                After
              </th>
            </tr>
          </thead>
          <tbody>
            {after.map((v, i) => (
              <tr key={i} className="border-b border-white/6 text-white/70">
                <td className="py-1.5 pr-4">{i * 10}%</td>
                <td className="py-1.5 pr-4">{Math.round(before[i] * 100)}%</td>
                <td className="py-1.5">{Math.round(v * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
