"use client";

import { useMemo, useState } from "react";
import { dayStr, addMonths, monthLabel, monthStart, monthEnd } from "@/lib/format";

export default function BackupPage() {
  const today = dayStr();
  const [mode, setMode] = useState("all"); // all | month | custom
  const [month, setMonth] = useState(today.slice(0, 7));
  const [from, setFrom] = useState(addMonths(today, -1));
  const [to, setTo] = useState(today);

  const months = useMemo(() => {
    const out = [];
    for (let i = 0; i < 18; i++) out.push(addMonths(today, -i).slice(0, 7));
    return out;
  }, [today]);

  // resolve the active range based on the selected mode
  const range = useMemo(() => {
    if (mode === "month") return { from: monthStart(month + "-01"), to: monthEnd(month + "-01") };
    if (mode === "custom") return { from, to };
    return { from: "", to: "" }; // all
  }, [mode, month, from, to]);

  function hrefFor(params) {
    const q = new URLSearchParams();
    if (range.from) q.set("from", range.from);
    if (range.to) q.set("to", range.to);
    for (const [k, v] of Object.entries(params)) q.set(k, v);
    return `/api/export?${q.toString()}`;
  }

  // browser download via a temporary anchor (cookie is sent with the request)
  function download(params) {
    const a = document.createElement("a");
    a.href = hrefFor(params);
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const rangeText =
    mode === "all"
      ? "All data (entire database)"
      : mode === "month"
      ? monthLabel(month)
      : `${from} → ${to}`;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">💾 Backup &amp; Export</h1>
      <p className="text-sm text-stone-500">
        Download a copy of your data so nothing is ever lost. The full JSON backup can restore
        everything; CSV files open directly in Excel.
      </p>

      {/* range selection */}
      <div className="card mt-5 p-5">
        <p className="label">What to include</p>
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All data"],
            ["month", "A specific month"],
            ["custom", "Custom range"],
          ].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setMode(val)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === val ? "bg-leaf text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        {mode === "month" && (
          <div className="mt-4 max-w-xs">
            <label className="label">Month</label>
            <select className="input" value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === "custom" && (
          <div className="mt-4 flex flex-wrap gap-3">
            <div>
              <label className="label">From</label>
              <input type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="label">To</label>
              <input type="date" className="input" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-stone-500">
          Selected: <span className="font-semibold text-stone-700">{rangeText}</span>
          <span className="text-stone-400">
            {" "}
            — note: customers &amp; products are always included in full; the range applies to
            purchases &amp; payments.
          </span>
        </p>
      </div>

      {/* downloads */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-stone-900">📦 Full backup</h2>
          <p className="mt-1 text-sm text-stone-500">
            One JSON file with everything — customers, products, purchases and payments. Keep it
            safe; it can rebuild the whole database.
          </p>
          <button className="btn-primary mt-4" onClick={() => download({ format: "json" })}>
            ⬇ Download full backup (JSON)
          </button>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-stone-900">📄 CSV spreadsheets</h2>
          <p className="mt-1 text-sm text-stone-500">
            Individual tables for Excel / Google Sheets.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => download({ format: "csv", table: "ledger" })}>
              📒 Daily ledger (grid)
            </button>
            <button className="btn-ghost" onClick={() => download({ format: "csv", table: "purchases" })}>
              Purchases (detailed)
            </button>
            <button className="btn-ghost" onClick={() => download({ format: "csv", table: "payments" })}>
              Payments
            </button>
            <button className="btn-ghost" onClick={() => download({ format: "csv", table: "customers" })}>
              Customers
            </button>
            <button className="btn-ghost" onClick={() => download({ format: "csv", table: "products" })}>
              Products
            </button>
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            The daily ledger grid shows one row per customer with a column for each day in the
            selected range — exactly like the on-screen ledger. Pick a month for the cleanest view.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-stone-400">
        💡 Tip: take a full backup at the end of every month and store it on your phone or Google
        Drive. If anything ever goes wrong, you&apos;ll still have your records.
      </p>
    </div>
  );
}
