"use client";

import { useState } from "react";
import { inr, monthLabel } from "@/lib/format";
import { colorFor } from "@/lib/colors";

const k = (v) =>
  v >= 100000 ? "₹" + (v / 100000).toFixed(1) + "L" : v >= 1000 ? "₹" + (v / 1000).toFixed(1) + "k" : "₹" + Math.round(v);

// Multi-line: each product's monthly sales trend. Axes labelled; hover/tap any
// point for the exact value.
export default function ProductTrendChart({ data }) {
  const [hov, setHov] = useState(null); // { si, i }
  const months = data?.months || [];
  const series = data?.series || [];
  if (months.length < 2 || series.length === 0)
    return (
      <p className="py-8 text-center text-sm text-stone-400">
        Select a range spanning at least two months to see the trend.
      </p>
    );

  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const n = months.length;
  const step = 80;
  const padL = 46;
  const padR = 16;
  const padT = 18;
  const padB = 46;
  const H = 290;
  const innerH = H - padT - padB;
  const W = padL + padR + (n - 1) * step;
  const xx = (i) => padL + i * step;
  const yy = (v) => padT + innerH - (v / max) * innerH;
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const hovPoint = hov ? { x: xx(hov.i), y: yy(series[hov.si].values[hov.i]) } : null;

  return (
    <div>
      {/* legend */}
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-stone-600">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-4 rounded-full" style={{ background: colorFor(s.slug) }} />
            {s.name}
          </span>
        ))}
      </div>
      <div className="ledger-scroll overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width={Math.max(W, 320)} height={H} className="min-w-full" onMouseLeave={() => setHov(null)}>
          {gridVals.map((g, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={yy(g)} y2={yy(g)} stroke={i === 0 ? "#cbd5e1" : "#eee"} strokeWidth="1" />
              <text x={padL - 6} y={yy(g) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
                {k(g)}
              </text>
            </g>
          ))}
          <line x1={padL} x2={padL} y1={padT} y2={yy(0)} stroke="#cbd5e1" strokeWidth="1" />
          <text x={10} y={padT - 6} fontSize="9" fill="#64748b" fontWeight="bold">
            ₹ Sales
          </text>
          {months.map((m, i) => (
            <text key={m} x={xx(i)} y={H - padB + 16} fontSize="9" fill="#78716c" textAnchor="middle">
              {monthLabel(m)}
            </text>
          ))}

          {series.map((s, si) => (
            <g key={s.name}>
              <polyline
                fill="none"
                stroke={colorFor(s.slug)}
                strokeWidth="2.5"
                points={s.values.map((v, i) => `${xx(i)},${yy(v)}`).join(" ")}
              />
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  cx={xx(i)}
                  cy={yy(v)}
                  r={hov && hov.si === si && hov.i === i ? 5 : 3}
                  fill={colorFor(s.slug)}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHov({ si, i })}
                  onClick={() => setHov({ si, i })}
                />
              ))}
            </g>
          ))}

          {/* tooltip */}
          {hov &&
            hovPoint &&
            (() => {
              const s = series[hov.si];
              const v = s.values[hov.i];
              const tw = 150;
              const th = 38;
              const tx = Math.min(Math.max(hovPoint.x - tw / 2, padL), W - padR - tw);
              const ty = Math.max(padT, hovPoint.y - th - 8);
              return (
                <g pointerEvents="none">
                  <rect x={tx} y={ty} width={tw} height={th} rx="6" fill="#1c1917" opacity="0.92" />
                  <text x={tx + 9} y={ty + 15} fontSize="9.5" fill="#ffffff" fontWeight="bold">
                    {s.name} — {monthLabel(months[hov.i])}
                  </text>
                  <text x={tx + 9} y={ty + 29} fontSize="9.5" fill="#86efac">
                    {inr(v)}
                  </text>
                </g>
              );
            })()}
        </svg>
      </div>
    </div>
  );
}
