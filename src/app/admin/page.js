"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { inr, prettyDate, round3, unitLabel } from "@/lib/format";
import ProductIcon from "@/components/ProductIcon";

export default function AdminDashboard() {
  const [s, setS] = useState(null);

  useEffect(() => {
    fetch("/api/summary")
      .then((r) => r.json())
      .then(setS)
      .catch(() => setS({ error: true }));
  }, []);

  if (!s)
    return (
      <div className="flex items-center justify-center p-20">
        <div className="spinner" />
      </div>
    );
  if (s.error)
    return <div className="card p-8 text-center text-stone-500">Could not load data — please refresh.</div>;

  const cards = [
    { label: "Total Outstanding (all customers)", value: inr(s.totalDue), color: "text-red-600", icon: "🧾" },
    {
      label: `Today's Sales (${s.todayEntries} entries)`,
      value: inr(s.todaySales),
      color: "text-leafdark",
      icon: "🥛",
      sub: `☀️ ${inr(s.todayMorningSales || 0)}  ·  🌙 ${inr(s.todayNightSales || 0)}`,
    },
    { label: "Today's Collection", value: inr(s.todayCollection), color: "text-green-700", icon: "💵" },
    { label: "Active Customers", value: s.customerCount, color: "text-stone-800", icon: "👥" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">📊 Dashboard</h1>
          <p className="text-sm text-stone-500">{prettyDate(s.today)} — business overview</p>
        </div>
        <Link href="/admin/ledger" className="btn-primary">
          📒 Open Ledger
        </Link>
      </div>

      {/* stat cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{c.label}</p>
              <span className="text-xl">{c.icon}</span>
            </div>
            <p className={`mt-2 text-2xl font-extrabold ${c.color}`}>{c.value}</p>
            {c.sub && <p className="mt-1 text-xs font-medium text-stone-500">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* stock alerts */}
      {(s.outOfStock.length > 0 || s.lowStock.length > 0) && (
        <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="font-display font-bold text-amber-900">⚠️ Stock Alert</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {s.outOfStock.map((p) => (
              <span key={p.slug} className="chip bg-red-600 text-white">
                <ProductIcon slug={p.slug} className="h-4 w-4" /> {p.name} OUT OF STOCK
              </span>
            ))}
            {s.lowStock.map((p) => (
              <span key={p.slug} className="chip bg-amber-200 text-amber-900">
                <ProductIcon slug={p.slug} className="h-4 w-4" /> {p.name}: only {round3(p.stock)} {unitLabel(p.unit)} left
              </span>
            ))}
          </div>
          <Link href="/admin/stock" className="mt-3 inline-block text-sm font-semibold text-amber-800 underline">
            Update stock →
          </Link>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* top dues */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Highest dues</h2>
            <Link href="/admin/customers" className="text-xs font-semibold text-leaf hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-3 divide-y divide-stone-100">
            {s.topDues.map((c) => (
              <Link
                key={c._id}
                href={`/admin/customers/${c._id}`}
                className="flex items-center justify-between py-2.5 hover:bg-stone-50"
              >
                <div>
                  <p className="text-sm font-semibold text-stone-800">{c.name}</p>
                  <p className="text-[11px] text-stone-400">{c.phone}</p>
                </div>
                <p className={`font-bold ${c.due > 0 ? "text-red-600" : "text-green-700"}`}>
                  {inr(c.due)}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* current stock */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Current stock</h2>
            <Link href="/admin/stock" className="text-xs font-semibold text-leaf hover:underline">
              Update →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {s.products.map((p) => {
              const pct = Math.min(100, (p.stock / Math.max(p.lowStockAt * 6, 1)) * 100);
              return (
                <div key={p.slug}>
                  <div className="flex items-center justify-between text-sm">
                    <p className="flex items-center gap-1.5 font-medium text-stone-700">
                      <ProductIcon slug={p.slug} className="h-4 w-4" /> {p.name}
                    </p>
                    <p className={`font-bold ${p.stock <= 0 ? "text-red-600" : p.stock <= p.lowStockAt ? "text-amber-600" : "text-stone-700"}`}>
                      {p.stock <= 0 ? "Out" : `${round3(p.stock)} ${unitLabel(p.unit)}`}
                    </p>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full ${
                        p.stock <= 0 ? "bg-red-400" : p.stock <= p.lowStockAt ? "bg-amber-400" : "bg-leaf"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
