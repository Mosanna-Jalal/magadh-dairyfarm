import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";
import { totalsByCustomer, dueOf } from "@/lib/ledger";
import { listDays } from "@/lib/format";

export const dynamic = "force-dynamic";

// GET /api/ledger?from=YYYY-MM-DD&to=YYYY-MM-DD
// The register grid: one horizontal row per customer, one column per day.
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const shift = searchParams.get("shift"); // morning | night | (all/none)
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });

  const custFilter = { active: true };
  const purFilter = { date: { $gte: from, $lte: to } };
  // Untagged legacy data (no shift field) is treated as morning / shown in both,
  // so existing records stay visible after the shift feature ships.
  if (shift === "morning") {
    purFilter.shift = { $ne: "night" };
    custFilter.shift = { $in: ["morning", "both", null] };
  } else if (shift === "night") {
    purFilter.shift = "night";
    custFilter.shift = { $in: ["night", "both", null] };
  }

  const [customers, purchases, payments, totals] = await Promise.all([
    Customer.find(custFilter).sort({ name: 1 }).lean(),
    Purchase.find(purFilter).lean(),
    Payment.find({ date: { $gte: from, $lte: to } }).lean(),
    totalsByCustomer(),
  ]);

  const days = listDays(from, to);
  const rows = customers.map((c) => {
    const cells = {};
    for (const d of days) cells[d] = { purchases: [], payments: [] };
    return { customer: c, ...dueOf(c, totals), cells, rangeTotal: 0, rangePaid: 0 };
  });
  const rowByCustomer = new Map(rows.map((r) => [String(r.customer._id), r]));

  for (const p of purchases) {
    const row = rowByCustomer.get(String(p.customerId));
    if (row && row.cells[p.date]) {
      row.cells[p.date].purchases.push(p);
      row.rangeTotal += p.total;
    }
  }
  for (const p of payments) {
    const row = rowByCustomer.get(String(p.customerId));
    if (row && row.cells[p.date]) {
      row.cells[p.date].payments.push(p);
      row.rangePaid += p.amount;
    }
  }

  const dayTotals = {};
  for (const d of days) {
    dayTotals[d] = rows.reduce(
      (s, r) => s + r.cells[d].purchases.reduce((x, p) => x + p.total, 0),
      0
    );
  }

  return NextResponse.json({ days, rows, dayTotals });
}
