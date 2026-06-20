"use client";

import { useState } from "react";
import { inr } from "@/lib/format";

const k = (v) =>
  v >= 100000 ? "₹" + (v / 100000).toFixed(1) + "L" : v >= 1000 ? "₹" + (v / 1000).toFixed(1) + "k" : "₹" + Math.round(v);

// Bars = sales, line = collections. Y/X axes labelled, value on each bar,
// hover/tap any bar for a detail tooltip.
export default function SalesChart({ points, labelFn }) {
  const [hov, setHov] = useState(null);
  if (!points || points.length === 0)
    return <p className="py-12 text-center text-sm text-stone-400">No sales in this range.</p>;

  const max = Math.max(1, ...points.map((p) => Math.max(p.sales, p.collection)));
  const n = points.length;
  const barW = n > 24 ? 14 : n > 14 ? 20 : 30;
  const gap = n > 24 ? 10 : 16;
  const padL = 46;
  const padR = 16;
  const padT = 22;
  const padB = 56;
  const H = 300;
  const innerH = H - padT - padB;
  const W = padL + padR + n * (barW + gap);
  const xx = (i) => padL + gap / 2 + i * (barW + gap);
  const yy = (v) => padT + innerH - (v / max) * innerH;
  const rotate = n > 8;
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);

  return (
    <div className="ledger-scroll overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={Math.max(W, 320)}
        height={H}
        className="min-w-full"
        onMouseLeave={() => setHov(null)}
      >
        {/* Y grid + labels */}
        {gridVals.map((g, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy(g)} y2={yy(g)} stroke={i === 0 ? "#cbd5e1" : "#eee"} strokeWidth="1" />
            <text x={padL - 6} y={yy(g) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
              {k(g)}
            </text>
          </g>
        ))}
        {/* Y axis line + title */}
        <line x1={padL} x2={padL} y1={padT} y2={yy(0)} stroke="#cbd5e1" strokeWidth="1" />
        <text x={10} y={padT - 8} fontSize="9" fill="#64748b" fontWeight="bold">
          ₹ Amount
        </text>

        {/* bars */}
        {points.map((p, i) => {
          const barH = Math.max(0, yy(0) - yy(p.sales));
          const cx = xx(i) + barW / 2;
          const active = hov === i;
          return (
            <g key={p.key} onMouseEnter={() => setHov(i)} onClick={() => setHov(i)} style={{ cursor: "pointer" }}>
              <rect x={xx(i) - gap / 2} y={padT} width={barW + gap} height={innerH} fill="transparent" />
              <rect x={xx(i)} y={yy(p.sales)} width={barW} height={barH} rx="3" fill={active ? "#2C5E36" : "#3E7C4A"} />
              {p.sales > 0 && (
                <text x={cx} y={yy(p.sales) - 4} fontSize="8.5" fill="#2C5E36" textAnchor="middle" fontWeight="bold">
                  {k(p.sales)}
                </text>
              )}
              <text
                x={cx}
                y={H - padB + 16}
                fontSize="9"
                fill="#78716c"
                textAnchor={rotate ? "end" : "middle"}
                transform={rotate ? `rotate(-45 ${cx} ${H - padB + 16})` : undefined}
              >
                {labelFn(p.key)}
              </text>
            </g>
          );
        })}

        {/* collection line + points */}
        <polyline
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          points={points.map((p, i) => `${xx(i) + barW / 2},${yy(p.collection)}`).join(" ")}
        />
        {points.map((p, i) => (
          <circle key={p.key} cx={xx(i) + barW / 2} cy={yy(p.collection)} r={hov === i ? 4 : 2.6} fill="#d97706" />
        ))}

        {/* tooltip */}
        {hov != null &&
          (() => {
            const p = points[hov];
            const cx = xx(hov) + barW / 2;
            const tw = 152;
            const th = 54;
            const tx = Math.min(Math.max(cx - tw / 2, padL), W - padR - tw);
            const ty = Math.max(padT, yy(Math.max(p.sales, p.collection)) - th - 8);
            return (
              <g pointerEvents="none">
                <rect x={tx} y={ty} width={tw} height={th} rx="6" fill="#1c1917" opacity="0.92" />
                <text x={tx + 9} y={ty + 16} fontSize="9.5" fill="#ffffff" fontWeight="bold">
                  {labelFn(p.key)}
                </text>
                <text x={tx + 9} y={ty + 31} fontSize="9" fill="#86efac">
                  Sales: {inr(p.sales)}
                </text>
                <text x={tx + 9} y={ty + 45} fontSize="9" fill="#fcd34d">
                  Collected: {inr(p.collection)}
                </text>
              </g>
            );
          })()}
      </svg>
    </div>
  );
}
