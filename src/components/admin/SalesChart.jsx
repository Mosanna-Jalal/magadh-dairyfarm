"use client";

import { inr } from "@/lib/format";

// Lightweight SVG chart: sales as bars, collections as an overlaid line.
export default function SalesChart({ points, labelFn }) {
  if (!points || points.length === 0)
    return <p className="py-12 text-center text-sm text-stone-400">No sales in this range.</p>;

  const max = Math.max(1, ...points.map((p) => Math.max(p.sales, p.collection)));
  const n = points.length;
  const barW = n > 24 ? 14 : n > 14 ? 20 : 30;
  const gap = n > 24 ? 8 : 14;
  const padL = 12;
  const padR = 12;
  const padT = 14;
  const padB = 52;
  const H = 290;
  const innerH = H - padT - padB;
  const W = padL + padR + n * (barW + gap);
  const xx = (i) => padL + i * (barW + gap);
  const yy = (v) => padT + innerH - (v / max) * innerH;
  const rotate = n > 10;
  const gridVals = [0.25, 0.5, 0.75, 1].map((f) => f * max);

  return (
    <div className="ledger-scroll overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width={Math.max(W, 320)} height={H} className="min-w-full">
        {/* gridlines */}
        {gridVals.map((g, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yy(g)} y2={yy(g)} stroke="#eee" strokeWidth="1" />
            <text x={padL} y={yy(g) - 2} fontSize="8" fill="#bbb">
              {inr(Math.round(g))}
            </text>
          </g>
        ))}
        {/* baseline */}
        <line x1={padL} x2={W - padR} y1={yy(0)} y2={yy(0)} stroke="#ddd" strokeWidth="1" />

        {/* sales bars */}
        {points.map((p, i) => {
          const barH = Math.max(0, yy(0) - yy(p.sales));
          return (
            <g key={p.key}>
              <rect x={xx(i)} y={yy(p.sales)} width={barW} height={barH} rx="3" fill="#3E7C4A">
                <title>
                  {labelFn(p.key)} — Sales {inr(p.sales)} · Collected {inr(p.collection)}
                </title>
              </rect>
              <text
                x={xx(i) + barW / 2}
                y={H - padB + 14}
                fontSize="9"
                fill="#78716c"
                textAnchor={rotate ? "end" : "middle"}
                transform={rotate ? `rotate(-45 ${xx(i) + barW / 2} ${H - padB + 14})` : undefined}
              >
                {labelFn(p.key)}
              </text>
            </g>
          );
        })}

        {/* collection line */}
        <polyline
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          points={points.map((p, i) => `${xx(i) + barW / 2},${yy(p.collection)}`).join(" ")}
        />
        {points.map((p, i) => (
          <circle key={p.key} cx={xx(i) + barW / 2} cy={yy(p.collection)} r="2.6" fill="#d97706" />
        ))}
      </svg>
    </div>
  );
}
