"use client";

import { inr, monthLabel } from "@/lib/format";
import { colorFor } from "@/lib/colors";

// Multi-line chart: each product's monthly sales trend across the range.
export default function ProductTrendChart({ data }) {
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
  const padL = 14;
  const padR = 14;
  const padT = 14;
  const padB = 44;
  const H = 280;
  const innerH = H - padT - padB;
  const W = padL + padR + (n - 1) * step;
  const xx = (i) => padL + i * step;
  const yy = (v) => padT + innerH - (v / max) * innerH;
  const gridVals = [0.25, 0.5, 0.75, 1].map((f) => f * max);

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
        <svg viewBox={`0 0 ${W} ${H}`} width={Math.max(W, 320)} height={H} className="min-w-full">
          {gridVals.map((g, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={yy(g)} y2={yy(g)} stroke="#eee" strokeWidth="1" />
              <text x={padL} y={yy(g) - 2} fontSize="8" fill="#bbb">
                {inr(Math.round(g))}
              </text>
            </g>
          ))}
          {months.map((m, i) => (
            <text key={m} x={xx(i)} y={H - padB + 16} fontSize="9" fill="#78716c" textAnchor="middle">
              {monthLabel(m)}
            </text>
          ))}
          {series.map((s) => (
            <g key={s.name}>
              <polyline
                fill="none"
                stroke={colorFor(s.slug)}
                strokeWidth="2.5"
                points={s.values.map((v, i) => `${xx(i)},${yy(v)}`).join(" ")}
              />
              {s.values.map((v, i) => (
                <circle key={i} cx={xx(i)} cy={yy(v)} r="3" fill={colorFor(s.slug)}>
                  <title>
                    {s.name} — {monthLabel(months[i])}: {inr(v)}
                  </title>
                </circle>
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
