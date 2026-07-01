"use client";

import { useState } from "react";
import Link from "next/link";
import { inr, prettyDate, dayStr, round3, unitLabel, addMonths, monthEnd } from "@/lib/format";
import ProductIcon from "@/components/ProductIcon";
import WhatsAppButton from "@/components/WhatsAppButton";
import Bill from "@/components/Bill";
import NoticePopup from "@/components/NoticePopup";

export default function PortalPage() {
  const [phone, setPhone] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // self-service bill
  const today = dayStr();
  const [billFrom, setBillFrom] = useState(today.slice(0, 7) + "-01");
  const [billTo, setBillTo] = useState(today);
  const [bill, setBill] = useState(null);
  const [genLoading, setGenLoading] = useState(false);

  function setThisMonth() {
    setBillFrom(today.slice(0, 7) + "-01");
    setBillTo(today);
  }
  function setLastMonth() {
    const ym = addMonths(today, -1).slice(0, 7);
    setBillFrom(ym + "-01");
    setBillTo(monthEnd(ym + "-01"));
  }

  async function generateBill() {
    setGenLoading(true);
    try {
      const res = await fetch(
        `/api/portal?phone=${encodeURIComponent(phone)}&from=${billFrom}&to=${billTo}`
      );
      const json = await res.json();
      if (res.ok && json.bill) setBill({ bill: json.bill, currentDue: json.due });
    } finally {
      setGenLoading(false);
    }
  }

  async function lookup(e) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`/api/portal?phone=${encodeURIComponent(phone)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-leafdark">
            🐄 Magadh Farm & Dairy Products
          </Link>
          <Link href="/" className="text-sm text-stone-500 hover:text-leaf">
            ← Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold text-stone-900">📒 My Account</h1>
        <p className="mt-1 text-sm text-stone-500">
          Enter your registered mobile number to view your daily purchases, payments and current
          balance.
        </p>

        <form onSubmit={lookup} className="card mt-6 flex flex-wrap items-end gap-3 p-5">
          <div className="grow">
            <label className="label">Mobile Number</label>
            <input
              className="input text-lg tracking-wider"
              placeholder="98XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <button className="btn-primary" disabled={loading || phone.replace(/\D/g, "").length < 10}>
            {loading ? "Loading…" : "View account →"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <div className="mt-8 space-y-6 animate-fade-up">
            {/* summary */}
            <div className="card overflow-hidden">
              <div className="bg-leafdark px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-widest text-green-200">Account holder</p>
                <p className="font-display text-2xl font-bold">{data.customer.name}</p>
                <p className="text-xs text-green-200">{data.customer.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-stone-200 sm:grid-cols-4">
                {[
                  ["Total purchased", inr(data.purchased + (data.customer.openingBalance || 0)), "text-stone-800"],
                  ["Total paid", inr(data.paid), "text-green-700"],
                  [
                    "Current due",
                    inr(data.due),
                    data.due > 0 ? "text-red-600" : "text-green-700",
                  ],
                  ["Opening balance", inr(data.customer.openingBalance || 0), "text-stone-500"],
                ].map(([k, v, c]) => (
                  <div key={k} className="bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                      {k}
                    </p>
                    <p className={`mt-1 text-xl font-bold ${c}`}>{v}</p>
                  </div>
                ))}
              </div>
              {data.due > 0 ? (
                <p className="bg-red-50 px-5 py-2 text-xs font-medium text-red-600">
                  Outstanding balance: {inr(data.due)} — kindly settle it on your next delivery.
                </p>
              ) : (
                <p className="bg-green-50 px-5 py-2 text-xs font-medium text-green-700">
                  ✅ Your account is fully settled. Thank you!
                </p>
              )}
            </div>

            {/* generate your own bill */}
            <div className="card p-5">
              <h2 className="font-display text-lg font-bold">🧾 Generate your bill</h2>
              <p className="mt-1 text-sm text-stone-500">
                Choose a date range and download a clean PDF bill of your purchases.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-ghost" onClick={setThisMonth}>
                  This month
                </button>
                <button className="btn-ghost" onClick={setLastMonth}>
                  Last month
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div>
                  <label className="label">From</label>
                  <input
                    type="date"
                    className="input"
                    value={billFrom}
                    max={billTo}
                    onChange={(e) => setBillFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">To</label>
                  <input
                    type="date"
                    className="input"
                    value={billTo}
                    min={billFrom}
                    max={today}
                    onChange={(e) => setBillTo(e.target.value)}
                  />
                </div>
                <button className="btn-primary" onClick={generateBill} disabled={genLoading}>
                  {genLoading ? "Preparing…" : "📄 Generate bill"}
                </button>
              </div>
            </div>

            {/* today's availability */}
            <div className="card p-5">
              <h2 className="font-display text-lg font-bold">Available at the farm today</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.products.map((p) => (
                  <span
                    key={p.slug}
                    className={`chip ${
                      p.stock <= 0
                        ? "bg-red-100 text-red-700"
                        : p.stock <= p.lowStockAt
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    <ProductIcon slug={p.slug} className="h-4 w-4" /> {p.name}:{" "}
                    {p.stock <= 0
                      ? "sold out"
                      : `${round3(p.stock)} ${unitLabel(p.unit)} • ${inr(p.price)}/${unitLabel(p.unit)}`}
                  </span>
                ))}
              </div>
            </div>

            {/* purchase log */}
            <div className="card p-5">
              <h2 className="font-display text-lg font-bold">
                🧾 Purchase History{" "}
                <span className="text-xs font-normal text-stone-400">(latest first)</span>
              </h2>
              <div className="mt-3 divide-y divide-stone-100">
                {data.purchases.length === 0 && (
                  <p className="py-4 text-sm text-stone-400">No entries yet.</p>
                )}
                {data.purchases.map((p) => (
                  <div key={p._id} className="flex items-start justify-between gap-3 py-3">
                    <div>
                      <p className="text-xs font-semibold text-stone-400">{prettyDate(p.date)}</p>
                      <p className="mt-0.5 text-sm text-stone-700">
                        {p.items.map((i) => `${i.name} ${i.qty} ${i.unit}`).join(" + ")}
                      </p>
                    </div>
                    <p className="shrink-0 font-bold text-stone-800">{inr(p.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* payments */}
            <div className="card p-5">
              <h2 className="font-display text-lg font-bold">💵 Payments</h2>
              <div className="mt-3 divide-y divide-stone-100">
                {data.payments.length === 0 && (
                  <p className="py-4 text-sm text-stone-400">No payments recorded yet.</p>
                )}
                {data.payments.map((p) => (
                  <div key={p._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs font-semibold text-stone-400">{prettyDate(p.date)}</p>
                      <p className="text-xs uppercase text-stone-500">{p.mode}</p>
                    </div>
                    <p className="font-bold text-green-700">− {inr(p.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {bill && (
        <Bill customer={data.customer} bill={bill.bill} onClose={() => setBill(null)} />
      )}

      <WhatsAppButton label="Contact the farm" />
      <NoticePopup />
    </main>
  );
}
