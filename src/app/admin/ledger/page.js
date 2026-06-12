"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { inr, dayStr, addDays, prettyDay, weekDay } from "@/lib/format";
import { EntryModal, PayModal } from "@/components/admin/Modals";

const WINDOW = 10; // days visible at once

const EMOJI = { Milk: "🥛", Paneer: "🧀", Ghee: "🧈", Khowa: "🥮", Dahi: "🥣" };

function CellContent({ cell }) {
  if (!cell || (cell.purchases.length === 0 && cell.payments.length === 0)) {
    return <span className="text-stone-300 group-hover:hidden">·</span>;
  }
  return (
    <div className="space-y-1">
      {cell.purchases.map((p) => (
        <div key={p._id} className="rounded-md bg-amber-50 px-1.5 py-1 text-left ring-1 ring-amber-200/60">
          <p className="text-[10px] leading-tight text-stone-600">
            {p.items.map((i) => `${EMOJI[i.name] || "•"}${i.qty}${i.unit === "litre" ? "L" : "kg"}`).join(" ")}
          </p>
          <p className="text-[11px] font-bold leading-tight text-stone-800">{inr(p.total)}</p>
        </div>
      ))}
      {cell.payments.map((p) => (
        <div key={p._id} className="rounded-md bg-green-100 px-1.5 py-0.5 ring-1 ring-green-300/60">
          <p className="text-[10px] font-bold text-green-800">💵 −{inr(p.amount)}</p>
        </div>
      ))}
    </div>
  );
}

export default function LedgerPage() {
  const today = dayStr();
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null); // { customerId?, date? }
  const [pay, setPay] = useState(null); // customer object
  const from = addDays(to, -(WINDOW - 1));

  const load = useCallback(async () => {
    setLoading(true);
    const [ledRes, custRes, prodRes] = await Promise.all([
      fetch(`/api/ledger?from=${from}&to=${to}`),
      fetch("/api/customers"),
      fetch("/api/products"),
    ]);
    const [led, cust, prod] = await Promise.all([ledRes.json(), custRes.json(), prodRes.json()]);
    setData(led);
    setCustomers(cust.customers || []);
    setProducts(prod.products || []);
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">📒 Daily Ledger</h1>
          <p className="text-sm text-stone-500">
            One row per customer — daily purchases, payments and a live running due. Click any
            cell to add an entry.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-ghost" onClick={() => setTo(addDays(to, -WINDOW))}>
            ← Previous
          </button>
          <button className="btn-ghost" onClick={() => setTo(today)} disabled={to === today}>
            Today
          </button>
          <button
            className="btn-ghost"
            onClick={() => setTo(addDays(to, WINDOW) > today ? today : addDays(to, WINDOW))}
            disabled={to === today}
          >
            Next →
          </button>
          <button className="btn-primary" onClick={() => setEntry({ date: today })}>
            ＋ New Entry
          </button>
        </div>
      </div>

      <div className="card mt-5 overflow-hidden">
        {loading && !data ? (
          <div className="flex items-center justify-center p-16">
            <div className="spinner" />
          </div>
        ) : !data || data.rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl">📭</p>
            <p className="mt-2 font-semibold text-stone-700">No customers yet</p>
            <p className="text-sm text-stone-500">
              Start by adding the customers from your manual register.
            </p>
            <Link href="/admin/customers" className="btn-primary mt-4">
              👥 Add customers
            </Link>
          </div>
        ) : (
          <div className="ledger-scroll overflow-auto" style={{ maxHeight: "72vh" }}>
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-leafdark text-left text-white">
                  <th className="sticky left-0 z-20 min-w-[170px] bg-leafdark px-3 py-2.5 font-semibold">
                    Customer ({data.rows.length})
                  </th>
                  {data.days.map((d) => (
                    <th
                      key={d}
                      className={`min-w-[92px] px-2 py-2 text-center font-medium ${
                        d === today ? "bg-leaf" : ""
                      }`}
                    >
                      <p className="text-[11px] uppercase opacity-75">{weekDay(d)}</p>
                      <p className="text-xs font-bold">{prettyDay(d)}</p>
                    </th>
                  ))}
                  <th className="min-w-[90px] px-2 py-2 text-right text-xs">Period Total</th>
                  <th className="min-w-[110px] px-3 py-2 text-right text-xs">Current Due</th>
                  <th className="min-w-[70px] px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, ri) => (
                  <tr key={row.customer._id} className={ri % 2 ? "bg-stone-50/60" : "bg-white"}>
                    <td className="sticky left-0 z-[5] border-r border-stone-200 bg-inherit px-3 py-2">
                      <Link
                        href={`/admin/customers/${row.customer._id}`}
                        className="font-semibold text-stone-800 hover:text-leaf"
                      >
                        {row.customer.name}
                      </Link>
                      <p className="text-[10px] text-stone-400">{row.customer.phone}</p>
                    </td>
                    {data.days.map((d) => (
                      <td
                        key={d}
                        onClick={() => setEntry({ customerId: row.customer._id, date: d })}
                        className={`group cursor-pointer border-r border-stone-100 px-1.5 py-1.5 text-center align-top transition hover:bg-leaf/10 ${
                          d === today ? "bg-green-50/70" : ""
                        }`}
                        title={`Add entry for ${row.customer.name} — ${prettyDay(d)}`}
                      >
                        <CellContent cell={row.cells[d]} />
                        <span className="hidden text-xs font-bold text-leaf group-hover:inline">＋</span>
                      </td>
                    ))}
                    <td className="px-2 py-2 text-right font-semibold text-stone-700">
                      {row.rangeTotal ? inr(row.rangeTotal) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`text-sm font-extrabold ${
                          row.due > 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {inr(row.due)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => setPay({ ...row.customer, due: row.due })}
                        className="rounded-lg bg-green-100 px-2 py-1 text-xs font-bold text-green-800 hover:bg-green-200"
                        title="Record payment"
                      >
                        ₹＋
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0">
                <tr className="bg-butter font-semibold text-stone-800">
                  <td className="sticky left-0 bg-butter px-3 py-2 text-xs uppercase tracking-wide">
                    Daily total
                  </td>
                  {data.days.map((d) => (
                    <td key={d} className="px-2 py-2 text-center text-xs">
                      {data.dayTotals[d] ? inr(data.dayTotals[d]) : "·"}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right text-xs">
                    {inr(data.rows.reduce((s, r) => s + r.rangeTotal, 0))}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-red-700">
                    {inr(data.rows.reduce((s, r) => s + Math.max(0, r.due), 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-stone-400">
        💡 Tip: click any empty cell to record that customer&apos;s purchase for that day. A green
        chip means a payment was received.
      </p>

      {entry && (
        <EntryModal
          customers={customers}
          products={products}
          preset={entry}
          onClose={() => setEntry(null)}
          onSaved={load}
        />
      )}
      {pay && <PayModal customer={pay} onClose={() => setPay(null)} onSaved={load} />}
    </div>
  );
}
