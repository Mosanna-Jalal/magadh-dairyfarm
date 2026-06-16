"use client";

import { useCallback, useEffect, useState } from "react";
import { inr, dayStr, addDays, monthLabel, prettyDay } from "@/lib/format";
import SalesChart from "@/components/admin/SalesChart";
import TopProductsChart from "@/components/admin/TopProductsChart";
import ProductTrendChart from "@/components/admin/ProductTrendChart";

function Stat({ label, value, color }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const today = dayStr();
  const [groupBy, setGroupBy] = useState("day");
  const [shift, setShift] = useState("all"); // all | morning | night
  const [from, setFrom] = useState(addDays(today, -13));
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const shiftQ = shift === "all" ? "" : `&shift=${shift}`;
    const res = await fetch(`/api/sales?from=${from}&to=${to}&groupBy=${groupBy}${shiftQ}`);
    setData(await res.json());
    setLoading(false);
  }, [from, to, groupBy, shift]);

  useEffect(() => {
    load();
  }, [load]);

  function preset(days) {
    setGroupBy("day");
    setFrom(addDays(today, -(days - 1)));
    setTo(today);
  }
  function thisMonth() {
    setGroupBy("day");
    setFrom(today.slice(0, 7) + "-01");
    setTo(today);
  }
  function thisYear() {
    setGroupBy("month");
    setFrom(today.slice(0, 4) + "-01-01");
    setTo(today);
  }

  const labelFn = (k) => (groupBy === "month" ? monthLabel(k) : prettyDay(k));

  function downloadCSV() {
    if (!data) return;
    const lines = [];
    lines.push(`Sales report,${from} to ${to}`);
    lines.push("");
    lines.push(groupBy === "month" ? "Month,Sales (INR),Collection (INR)" : "Date,Sales (INR),Collection (INR)");
    for (const p of data.points || []) lines.push(`${labelFn(p.key)},${p.sales},${p.collection}`);
    lines.push("");
    lines.push("Product demand (selected range)");
    lines.push("Product,Quantity,Unit,Sales (INR)");
    for (const p of data.products || []) lines.push(`${p.name},${p.qty},${p.unit || ""},${p.sales}`);
    lines.push("");
    lines.push(`Total sales,${data.totalSales || 0}`);
    lines.push(`Total collected,${data.totalCollection || 0}`);
    downloadText(`magadh_sales_${from}_to_${to}.csv`, lines.join("\n"));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">📈 Sales Report</h1>
          <p className="text-sm text-stone-500">
            Sales, collections and product demand — day-wise, month-wise or any custom range.
          </p>
        </div>
        <button className="btn-ghost" onClick={downloadCSV} disabled={!data}>
          ⬇ Download report (CSV)
        </button>
      </div>

      {/* controls */}
      <div className="card mt-5 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label">From</label>
          <input type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">To</label>
          <input type="date" className="input" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label className="label">Group by</label>
          <select className="input" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Day</option>
            <option value="month">Month</option>
          </select>
        </div>
        <div>
          <label className="label">Session</label>
          <select className="input" value={shift} onChange={(e) => setShift(e.target.value)}>
            <option value="all">All</option>
            <option value="morning">☀️ Morning</option>
            <option value="night">🌙 Night</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => preset(7)}>
            Last 7 days
          </button>
          <button className="btn-ghost" onClick={() => preset(30)}>
            Last 30 days
          </button>
          <button className="btn-ghost" onClick={thisMonth}>
            This month
          </button>
          <button className="btn-ghost" onClick={thisYear}>
            This year
          </button>
        </div>
      </div>

      {/* totals */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Total sales" value={inr(data?.totalSales || 0)} color="text-leafdark" />
        <Stat label="Total collected" value={inr(data?.totalCollection || 0)} color="text-amber-600" />
        <Stat
          label="Net (sales − collected)"
          value={inr((data?.totalSales || 0) - (data?.totalCollection || 0))}
          color="text-stone-700"
        />
      </div>

      {/* sales-over-time chart */}
      <div className="card mt-5 p-5">
        <h2 className="font-display text-lg font-bold text-stone-900">Sales &amp; collections over time</h2>
        <div className="mb-3 mt-2 flex items-center gap-4 text-xs text-stone-600">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-leaf" /> Sales
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-amber-600" /> Collected
          </span>
        </div>
        {loading && !data ? (
          <div className="flex justify-center p-12">
            <div className="spinner" />
          </div>
        ) : (
          <SalesChart points={data?.points || []} labelFn={labelFn} />
        )}
      </div>

      {/* product demand + monthly trend */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-stone-900">🏆 Product demand</h2>
          <p className="mb-3 text-xs text-stone-500">Which products sold the most in the selected range.</p>
          <TopProductsChart products={data?.products || []} />
        </div>
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-stone-900">Product-wise monthly trend</h2>
          <p className="mb-3 text-xs text-stone-500">How each product&apos;s monthly sales move over time.</p>
          <ProductTrendChart data={data?.productMonths} />
        </div>
      </div>
    </div>
  );
}
