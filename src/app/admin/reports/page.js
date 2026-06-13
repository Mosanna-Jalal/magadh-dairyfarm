"use client";

import { useCallback, useEffect, useState } from "react";
import { inr, dayStr, addDays, monthLabel, prettyDay } from "@/lib/format";
import SalesChart from "@/components/admin/SalesChart";

function Stat({ label, value, color }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

export default function ReportsPage() {
  const today = dayStr();
  const [groupBy, setGroupBy] = useState("day");
  const [from, setFrom] = useState(addDays(today, -13));
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/sales?from=${from}&to=${to}&groupBy=${groupBy}`);
    setData(await res.json());
    setLoading(false);
  }, [from, to, groupBy]);

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

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">📈 Sales Report</h1>
      <p className="text-sm text-stone-500">
        Track sales and collections day-wise, month-wise or for any custom date range.
      </p>

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

      {/* chart */}
      <div className="card mt-5 p-5">
        <div className="mb-3 flex items-center gap-4 text-xs text-stone-600">
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
    </div>
  );
}
