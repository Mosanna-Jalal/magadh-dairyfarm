import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Product from "@/models/Product";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";
import { totalsByCustomer, dueOf } from "@/lib/ledger";
import { listDays, prettyDay, dayStr } from "@/lib/format";

export const dynamic = "force-dynamic";

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

function toCSV(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

// GET /api/export?format=json|csv&table=purchases|payments|customers|products&from=&to=
// JSON = full backup of everything (purchases/payments filtered by range if given).
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const format = searchParams.get("format") || "json";
  const table = searchParams.get("table") || "purchases";

  const dateQ = {};
  if (from) dateQ.$gte = from;
  if (to) dateQ.$lte = to;
  const hasRange = from || to;
  const rangeFilter = hasRange ? { date: dateQ } : {};

  const [customers, products, purchases, payments] = await Promise.all([
    Customer.find().sort({ name: 1 }).lean(),
    Product.find().sort({ sortOrder: 1 }).lean(),
    Purchase.find(rangeFilter).sort({ date: 1 }).lean(),
    Payment.find(rangeFilter).sort({ date: 1 }).lean(),
  ]);

  const rangeLabel = hasRange ? `_${from || "start"}_to_${to || "end"}` : "_all";
  const stamp = new Date().toISOString().slice(0, 10);

  // lookup so purchase/payment rows carry a readable customer name & mobile
  const custMap = new Map(customers.map((c) => [String(c._id), c]));

  if (format === "csv") {
    let rows = [];
    let name = table;
    if (table === "ledger") {
      // Grid like the on-screen daily ledger: one row per customer, one column per day.
      name = "daily_ledger";
      const allDates = purchases.map((p) => p.date).sort();
      const lo = from || allDates[0] || dayStr();
      const hi = to || allDates[allDates.length - 1] || dayStr();
      const days = listDays(lo, hi);
      const dayLabels = days.map((d) => prettyDay(d));

      // gather purchases + payments per customer per day
      const grid = new Map(); // custId -> { date -> { total, items[], paid } }
      const cellOf = (k, d) => {
        let cd = grid.get(k);
        if (!cd) {
          cd = {};
          grid.set(k, cd);
        }
        if (!cd[d]) cd[d] = { total: 0, items: [], paid: 0 };
        return cd[d];
      };
      for (const p of purchases) {
        const cell = cellOf(String(p.customerId), p.date);
        cell.total += p.total;
        for (const it of p.items || [])
          cell.items.push(`${it.name} ${it.qty}${it.unit === "litre" ? "L" : "kg"}`);
      }
      for (const pay of payments) cellOf(String(pay.customerId), pay.date).paid += pay.amount;

      const totals = await totalsByCustomer(); // all-time, for the live due
      rows = customers.map((c) => {
        const row = { Customer: c.name, Phone: c.phone || "" };
        const cd = grid.get(String(c._id)) || {};
        let periodPurchases = 0;
        let periodPaid = 0;
        days.forEach((d, i) => {
          const cell = cd[d];
          if (!cell) {
            row[dayLabels[i]] = "";
            return;
          }
          periodPurchases += cell.total;
          periodPaid += cell.paid;
          let txt = cell.items.length ? `${cell.items.join(", ")} = ₹${r2(cell.total)}` : "";
          if (cell.paid) txt += (txt ? " | " : "") + `Paid ₹${r2(cell.paid)}`;
          row[dayLabels[i]] = txt;
        });
        row["Period Purchases"] = r2(periodPurchases);
        row["Period Paid"] = r2(periodPaid);
        row["Current Due"] = r2(dueOf(c, totals).due);
        return row;
      });
    } else if (table === "customers")
      rows = customers.map((c) => ({
        name: c.name,
        phone: c.phone,
        address: c.address,
        openingBalance: c.openingBalance,
        active: c.active,
        id: String(c._id),
      }));
    else if (table === "products")
      rows = products.map((p) => ({
        name: p.name,
        unit: p.unit,
        price: p.price,
        stock: p.stock,
        id: String(p._id),
      }));
    else if (table === "payments")
      rows = payments.map((p) => {
        const c = custMap.get(String(p.customerId));
        return {
          date: p.date,
          customer: c?.name || "",
          phone: c?.phone || "",
          amount: p.amount,
          mode: p.mode,
          note: p.note,
          customerId: String(p.customerId),
        };
      });
    else {
      name = "purchases";
      for (const p of purchases) {
        const c = custMap.get(String(p.customerId));
        for (const it of p.items || [])
          rows.push({
            date: p.date,
            session: p.shift || "morning",
            customer: c?.name || "",
            phone: c?.phone || "",
            product: it.name,
            qty: it.qty,
            unit: it.unit,
            rate: it.rate,
            amount: it.amount,
            billTotal: p.total,
            note: p.note,
            customerId: String(p.customerId),
          });
      }
    }
    return new NextResponse(toCSV(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="magadh_${name}${rangeLabel}.csv"`,
      },
    });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    app: "Magadh Farm & Dairy Products",
    range: { from: from || null, to: to || null },
    counts: {
      customers: customers.length,
      products: products.length,
      purchases: purchases.length,
      payments: payments.length,
    },
    customers,
    products,
    purchases,
    payments,
  };
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="magadh_backup${rangeLabel}_${stamp}.json"`,
    },
  });
}
