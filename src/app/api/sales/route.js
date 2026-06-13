import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";
import { listDays, listMonths } from "@/lib/format";

export const dynamic = "force-dynamic";

// GET /api/sales?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|month
// Returns sales (purchases) and collection (payments) bucketed by day or month.
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const groupBy = searchParams.get("groupBy") === "month" ? "month" : "day";
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });

  const [purchases, payments] = await Promise.all([
    Purchase.find({ date: { $gte: from, $lte: to } }).select("date total").lean(),
    Payment.find({ date: { $gte: from, $lte: to } }).select("date amount").lean(),
  ]);

  const keyOf = (d) => (groupBy === "month" ? d.slice(0, 7) : d);
  const buckets = groupBy === "month" ? listMonths(from, to) : listDays(from, to);
  const map = new Map(buckets.map((b) => [b, { key: b, sales: 0, collection: 0 }]));

  for (const p of purchases) {
    const o = map.get(keyOf(p.date));
    if (o) o.sales += p.total;
  }
  for (const p of payments) {
    const o = map.get(keyOf(p.date));
    if (o) o.collection += p.amount;
  }

  const points = [...map.values()];
  const totalSales = points.reduce((s, p) => s + p.sales, 0);
  const totalCollection = points.reduce((s, p) => s + p.collection, 0);

  return NextResponse.json({ points, totalSales, totalCollection, groupBy });
}
