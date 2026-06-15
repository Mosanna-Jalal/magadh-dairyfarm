"use client";

import { inr } from "@/lib/format";
import { colorFor } from "@/lib/colors";
import ProductIcon from "@/components/ProductIcon";

// Horizontal bars showing which product is in highest demand (by sales value).
export default function TopProductsChart({ products }) {
  if (!products || products.length === 0)
    return <p className="py-8 text-center text-sm text-stone-400">No product sales in this range.</p>;

  const max = Math.max(1, ...products.map((p) => p.sales));
  return (
    <div className="space-y-3">
      {products.map((p, i) => (
        <div key={p.name}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <ProductIcon slug={p.slug} className="h-4 w-4" />
              {i === 0 && <span title="Top seller">🏆</span>}
              {p.name}
              <span className="text-xs text-stone-400">
                · {p.qty} {p.unit} sold
              </span>
            </span>
            <span className="font-bold text-stone-800">{inr(p.sales)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(p.sales / max) * 100}%`, background: colorFor(p.slug) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
