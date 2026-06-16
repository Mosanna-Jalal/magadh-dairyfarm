"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  inr,
  dayStr,
  addDays,
  listDays,
  prettyDay,
  weekDay,
  monthStart,
  monthEnd,
  monthLabel,
  addMonths,
} from "@/lib/format";
import ProductIcon from "@/components/ProductIcon";
import { EntryModal, PayModal } from "@/components/admin/Modals";

function CellContent({ cell }) {
  if (!cell || (cell.purchases.length === 0 && cell.payments.length === 0)) {
    return <span className="text-stone-300 group-hover:hidden">·</span>;
  }
  return (
    <div className="space-y-1">
      {cell.purchases.map((p) => (
        <div key={p._id} className="rounded-md bg-amber-50 px-1.5 py-1 text-left ring-1 ring-amber-200/60">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] leading-tight text-stone-600">
            <span title={p.shift === "night" ? "Night" : "Morning"}>
              {p.shift === "night" ? "🌙" : "☀️"}
            </span>
            {p.items.map((i, idx) => (
              <span key={idx} className="inline-flex items-center gap-0.5">
                <ProductIcon slug={i.name.toLowerCase()} className="h-3 w-3" />
                {i.qty}
                {i.unit === "litre" ? "L" : "kg"}
              </span>
            ))}
          </div>
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
  const [from, setFrom] = useState(addDays(today, -9));
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [shift, setShift] = useState("morning"); // morning | night | all
  const [entry, setEntry] = useState(null); // { customerId?, date?, shift? }
  const [pay, setPay] = useState(null); // customer object

  // last 12 months for the quick "jump to month" dropdown (recent first)
  const months = useMemo(() => {
    const out = [];
    for (let i = 0; i < 12; i++) out.push(addMonths(today, -i).slice(0, 7));
    return out;
  }, [today]);

  const load = useCallback(async () => {
    setLoading(true);
    const shiftQ = shift === "all" ? "" : `&shift=${shift}`;
    const [ledRes, custRes, prodRes] = await Promise.all([
      fetch(`/api/ledger?from=${from}&to=${to}${shiftQ}`),
      fetch("/api/customers"),
      fetch("/api/products"),
    ]);
    const [led, cust, prod] = await Promise.all([ledRes.json(), custRes.json(), prodRes.json()]);
    setData(led);
    setCustomers(cust.customers || []);
    setProducts(prod.products || []);
    setLoading(false);
  }, [from, to, shift]);

  useEffect(() => {
    load();
  }, [load]);

  function shiftRange(dir) {
    const len = listDays(from, to).length;
    let nf = addDays(from, dir * len);
    let nt = addDays(to, dir * len);
    if (nt > today) {
      nt = today;
      nf = addDays(today, -(len - 1));
    }
    setFrom(nf);
    setTo(nt);
  }

  function pickMonth(ym) {
    setFrom(monthStart(ym + "-01"));
    setTo(ym === today.slice(0, 7) ? today : monthEnd(ym + "-01"));
  }

  // filter rows by the customer search box
  const rows = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    if (!s) return data.rows;
    return data.rows.filter(
      (r) =>
        r.customer.name.toLowerCase().includes(s) ||
        (r.customer.phone || "").includes(s) ||
        (r.customer.address || "").toLowerCase().includes(s)
    );
  }, [data, q]);

  const dayTotalsFiltered = useMemo(() => {
    if (!data) return {};
    const t = {};
    for (const d of data.days)
      t[d] = rows.reduce((s, r) => s + r.cells[d].purchases.reduce((x, p) => x + p.total, 0), 0);
    return t;
  }, [data, rows]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">📒 Daily Ledger</h1>
          <p className="text-sm text-stone-500">
            One row per customer — daily purchases, payments and a live running due. Click any cell
            to add an entry.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setEntry({ date: today, shift: shift === "all" ? "morning" : shift })}
        >
          ＋ New Entry
        </button>
      </div>

      {/* session toggle — morning and night have different customers */}
      <div className="mt-4 inline-flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
        {[
          ["morning", "☀️ Morning"],
          ["night", "🌙 Night"],
          ["all", "Both / All"],
        ].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setShift(val)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              shift === val ? "bg-leaf text-white shadow" : "text-stone-600 hover:text-leaf"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* filters */}
      <div className="card mt-4 flex flex-wrap items-end gap-3 p-3">
        <div>
          <label className="label">From</label>
          <input type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">To</label>
          <input type="date" className="input" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label className="label">Jump to month</label>
          <select
            className="input"
            value={from.slice(0, 7) === to.slice(0, 7) ? from.slice(0, 7) : ""}
            onChange={(e) => e.target.value && pickMonth(e.target.value)}
          >
            <option value="">Select…</option>
            {months.map((ym) => (
              <option key={ym} value={ym}>
                {monthLabel(ym)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => { setFrom(addDays(today, -9)); setTo(today); }}>
            Last 10 days
          </button>
          <button className="btn-ghost" onClick={() => pickMonth(today.slice(0, 7))}>
            This month
          </button>
          <button className="btn-ghost" onClick={() => shiftRange(-1)} title="Earlier">
            ←
          </button>
          <button className="btn-ghost" onClick={() => shiftRange(1)} disabled={to === today} title="Later">
            →
          </button>
        </div>
        <div className="grow" />
        <input
          className="input max-w-[220px]"
          placeholder="🔍 Find customer (name / phone / address)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card mt-4 overflow-hidden">
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
          <div className="ledger-scroll overflow-auto" style={{ maxHeight: "70vh" }}>
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-leafdark text-left text-white">
                  <th className="sticky left-0 z-20 min-w-[180px] bg-leafdark px-3 py-2.5 font-semibold">
                    Customer ({rows.length})
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
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={data.days.length + 4} className="p-8 text-center text-sm text-stone-400">
                      No customer matches “{q}”.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, ri) => (
                    <tr key={row.customer._id} className={ri % 2 ? "bg-stone-50/60" : "bg-white"}>
                      <td className="sticky left-0 z-[5] border-r border-stone-200 bg-inherit px-3 py-2">
                        <Link
                          href={`/admin/customers/${row.customer._id}`}
                          className="font-semibold text-stone-800 hover:text-leaf"
                        >
                          {row.customer.name}
                        </Link>
                        <p className="text-[10px] text-stone-400">
                          {[row.customer.phone, row.customer.address].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </td>
                      {data.days.map((d) => (
                        <td
                          key={d}
                          onClick={() =>
                            setEntry({
                              customerId: row.customer._id,
                              date: d,
                              shift: shift === "all" ? "morning" : shift,
                            })
                          }
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
                  ))
                )}
              </tbody>
              <tfoot className="sticky bottom-0">
                <tr className="bg-butter font-semibold text-stone-800">
                  <td className="sticky left-0 bg-butter px-3 py-2 text-xs uppercase tracking-wide">
                    Daily total
                  </td>
                  {data.days.map((d) => (
                    <td key={d} className="px-2 py-2 text-center text-xs">
                      {dayTotalsFiltered[d] ? inr(dayTotalsFiltered[d]) : "·"}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right text-xs">
                    {inr(rows.reduce((s, r) => s + r.rangeTotal, 0))}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-red-700">
                    {inr(rows.reduce((s, r) => s + Math.max(0, r.due), 0))}
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
