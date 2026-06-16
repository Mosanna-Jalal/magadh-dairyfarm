import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";
import { listDays, listMonths } from "@/lib/format";

export const dynamic = "force-dynamic";

// GET /api/sales?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|month
// Returns: time series (sales + collection), product demand breakdown, and a
// product-wise monthly trend for the range.
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const groupBy = searchParams.get("groupBy") === "month" ? "month" : "day";
  const shift = searchParams.get("shift"); // morning | night | (all)
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });

  const purFilter = { date: { $gte: from, $lte: to } };
  if (shift === "morning" || shift === "night") purFilter.shift = shift;

  const [purchases, payments] = await Promise.all([
    Purchase.find(purFilter).select("date total items shift").lean(),
    Payment.find({ date: { $gte: from, $lte: to } }).select("date amount").lean(),
  ]);

  // ── time series (sales + collection) ──
  const keyOf = (d) => (groupBy === "month" ? d.slice(0, 7) : d);
  const buckets = groupBy === "month" ? listMonths(from, to) : listDays(from, to);
  const tmap = new Map(buckets.map((b) => [b, { key: b, sales: 0, collection: 0 }]));
  for (const p of purchases) {
    const o = tmap.get(keyOf(p.date));
    if (o) o.sales += p.total;
  }
  for (const p of payments) {
    const o = tmap.get(keyOf(p.date));
    if (o) o.collection += p.amount;
  }
  const points = [...tmap.values()];

  // ── product demand breakdown (which product sold the most) ──
  const prodMap = new Map();
  for (const p of purchases) {
    for (const it of p.items || []) {
      const cur = prodMap.get(it.name) || {
        name: it.name,
        slug: (it.name || "").toLowerCase(),
        unit: it.unit,
        sales: 0,
        qty: 0,
      };
      cur.sales += it.amount || 0;
      cur.qty += it.qty || 0;
      prodMap.set(it.name, cur);
    }
  }
  const products = [...prodMap.values()].sort((a, b) => b.sales - a.sales);

  // ── product-wise monthly trend ──
  const months = listMonths(from, to);
  const mi = new Map(months.map((m, i) => [m, i]));
  const seriesMap = new Map();
  for (const p of purchases) {
    const idx = mi.get(p.date.slice(0, 7));
    if (idx === undefined) continue;
    for (const it of p.items || []) {
      let arr = seriesMap.get(it.name);
      if (!arr) {
        arr = new Array(months.length).fill(0);
        seriesMap.set(it.name, arr);
      }
      arr[idx] += it.amount || 0;
    }
  }
  const productMonths = {
    months,
    series: [...seriesMap.entries()].map(([name, values]) => ({
      name,
      slug: name.toLowerCase(),
      values,
    })),
  };

  const totalSales = points.reduce((s, p) => s + p.sales, 0);
  const totalCollection = points.reduce((s, p) => s + p.collection, 0);

  return NextResponse.json({
    points,
    products,
    productMonths,
    totalSales,
    totalCollection,
    groupBy,
  });
}
