"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { inr, prettyDate, unitLabel, dayStr, addMonths, monthEnd } from "@/lib/format";
import { toast } from "@/lib/toast";
import { EntryModal, PayModal } from "@/components/admin/Modals";
import Bill from "@/components/Bill";

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [entry, setEntry] = useState(false);
  const [pay, setPay] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // bill generation (built from the already-loaded purchases/payments)
  const today = dayStr();
  const [billFrom, setBillFrom] = useState(today.slice(0, 7) + "-01");
  const [billTo, setBillTo] = useState(today);
  const [bill, setBill] = useState(null);

  function setThisMonth() {
    setBillFrom(today.slice(0, 7) + "-01");
    setBillTo(today);
  }
  function setLastMonth() {
    const ym = addMonths(today, -1).slice(0, 7);
    setBillFrom(ym + "-01");
    setBillTo(monthEnd(ym + "-01"));
  }
  function generateBill() {
    const inRange = (d) => d >= billFrom && d <= billTo;
    const byDate = (a, b) => (a.date < b.date ? -1 : 1);
    const purchases = (data.purchases || []).filter((p) => inRange(p.date)).sort(byDate);
    const payments = (data.payments || []).filter((p) => inRange(p.date)).sort(byDate);
    // running balance carried into the period (opening + everything before `from`)
    const prevPur = (data.purchases || []).filter((p) => p.date < billFrom).reduce((s, p) => s + p.total, 0);
    const prevPay = (data.payments || []).filter((p) => p.date < billFrom).reduce((s, p) => s + p.amount, 0);
    const previousBalance = (data.customer?.openingBalance || 0) + prevPur - prevPay;
    setBill({
      from: billFrom,
      to: billTo,
      previousBalance,
      purchases,
      payments,
      purchased: purchases.reduce((s, p) => s + p.total, 0),
      paid: payments.reduce((s, p) => s + p.amount, 0),
    });
  }

  const load = useCallback(async () => {
    const [dRes, pRes] = await Promise.all([
      fetch(`/api/customers/${id}`),
      fetch("/api/products"),
    ]);
    const d = await dRes.json();
    const p = await pRes.json();
    setData(d);
    setProducts(p.products || []);
    setEditForm({
      name: d.customer?.name || "",
      phone: d.customer?.phone || "",
      address: d.customer?.address || "",
      shift: d.customer?.shift || "both",
      house: d.customer?.house || false,
      openingBalance: d.customer?.openingBalance ?? 0,
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveEdit(e) {
    e.preventDefault();
    const res = await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, openingBalance: Number(editForm.openingBalance || 0) }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(json.error || "Could not save changes", "error");
      return;
    }
    setEditing(false);
    load();
  }

  async function removePurchase(pid) {
    if (!confirm("Delete this entry? Its stock will be added back.")) return;
    await fetch(`/api/purchases/${pid}`, { method: "DELETE" });
    load();
  }

  async function removePayment(pid) {
    if (!confirm("Delete this payment?")) return;
    await fetch(`/api/payments/${pid}`, { method: "DELETE" });
    load();
  }

  if (!data)
    return (
      <div className="flex justify-center p-20">
        <div className="spinner" />
      </div>
    );
  if (data.error) return <div className="card p-8 text-center text-stone-500">{data.error}</div>;

  const c = data.customer;

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-stone-400 hover:text-leaf">
        ← All customers
      </Link>

      {/* header */}
      <div className="card mt-2 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 bg-leafdark p-5 text-white">
          <div>
            <h1 className="font-display text-2xl font-bold">{c.name}</h1>
            <p className="text-sm text-green-200">
              📞 {c.phone || "no number"} {c.address ? `• 🏠 ${c.address}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-light" onClick={() => setEditing(!editing)}>
              ✏️ Edit
            </button>
            <button className="btn-light" onClick={() => setEntry(true)}>
              ＋ Entry
            </button>
            <button
              className="btn bg-amber-400 text-amber-950 hover:bg-amber-300"
              onClick={() => setPay(true)}
            >
              💵 Record Payment
            </button>
          </div>
        </div>

        {editing && (
          <form onSubmit={saveEdit} className="grid gap-3 border-b border-stone-100 bg-amber-50/50 p-4 sm:grid-cols-4">
            {[
              ["name", "Name"],
              ["phone", "Mobile"],
              ["address", "Address"],
              ["openingBalance", "Opening balance (₹)"],
            ].map(([k, label]) => (
              <div key={k}>
                <label className="label">{label}</label>
                <input
                  className="input"
                  type={k === "openingBalance" ? "number" : "text"}
                  value={editForm[k]}
                  onChange={(e) => setEditForm({ ...editForm, [k]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="label">Session</label>
              <select
                className="input"
                value={editForm.shift}
                onChange={(e) => setEditForm({ ...editForm, shift: e.target.value })}
              >
                <option value="morning">☀️ Morning</option>
                <option value="night">🌙 Night</option>
                <option value="both">Both</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-stone-600 sm:col-span-4">
              <input
                type="checkbox"
                className="h-4 w-4 accent-violet-600"
                checked={editForm.house}
                onChange={(e) => setEditForm({ ...editForm, house: e.target.checked })}
              />
              🏠 Owner&apos;s home account (leftover milk — excluded from sales)
            </label>
            <div className="sm:col-span-4">
              <button className="btn-primary">✓ Save</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 gap-px bg-stone-200 sm:grid-cols-4">
          {[
            ["Opening balance", inr(c.openingBalance), "text-stone-600"],
            ["Total purchased", inr(data.purchased), "text-stone-800"],
            ["Total paid", inr(data.paid), "text-green-700"],
            ["Current due", inr(data.due), data.due > 0 ? "text-red-600" : "text-green-700"],
          ].map(([k, v, cls]) => (
            <div key={k} className="bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">{k}</p>
              <p className={`mt-1 text-xl font-extrabold ${cls}`}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* generate bill */}
      <div className="card mt-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-stone-900">🧾 Generate Bill</h2>
            <p className="text-sm text-stone-500">Pick a range and save this customer&apos;s bill as PDF.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={setThisMonth}>
              This month
            </button>
            <button className="btn-ghost" onClick={setLastMonth}>
              Last month
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={billFrom} max={billTo} onChange={(e) => setBillFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={billTo} min={billFrom} max={today} onChange={(e) => setBillTo(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={generateBill}>
            📄 Generate bill
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* purchases */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold">🧾 Purchases ({data.purchases.length})</h2>
          <div className="mt-3 max-h-[60vh] divide-y divide-stone-100 overflow-y-auto pr-1">
            {data.purchases.length === 0 && (
              <p className="py-6 text-center text-sm text-stone-400">No entries yet.</p>
            )}
            {data.purchases.map((p) => (
              <div key={p._id} className="group flex items-start justify-between gap-2 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-stone-400">
                    {prettyDate(p.date)} <span title={p.shift === "night" ? "Night" : "Morning"}>{p.shift === "night" ? "🌙" : "☀️"}</span>
                  </p>
                  <p className="text-sm text-stone-700">
                    {p.items.map((i) => `${i.name} ${i.qty}${unitLabel(i.unit)} (${inr(i.amount)})`).join(" + ")}
                  </p>
                  {p.note && <p className="text-[11px] italic text-stone-400">“{p.note}”</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="font-bold">{inr(p.total)}</p>
                  <button
                    onClick={() => removePurchase(p._id)}
                    className="invisible rounded-md px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50 group-hover:visible"
                    title="Delete entry (stock will be restored)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* payments */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold">💵 Payments ({data.payments.length})</h2>
          <div className="mt-3 max-h-[60vh] divide-y divide-stone-100 overflow-y-auto pr-1">
            {data.payments.length === 0 && (
              <p className="py-6 text-center text-sm text-stone-400">No payments yet.</p>
            )}
            {data.payments.map((p) => (
              <div key={p._id} className="group flex items-center justify-between py-2.5">
                <div>
                  <p className="text-xs font-semibold text-stone-400">{prettyDate(p.date)}</p>
                  <p className="text-xs uppercase text-stone-500">
                    {p.mode}
                    {p.note ? ` • ${p.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-green-700">− {inr(p.amount)}</p>
                  <button
                    onClick={() => removePayment(p._id)}
                    className="invisible rounded-md px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50 group-hover:visible"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {entry && (
        <EntryModal
          customers={[c]}
          products={products}
          preset={{ customerId: c._id }}
          onClose={() => setEntry(false)}
          onSaved={load}
        />
      )}
      {pay && <PayModal customer={{ ...c, due: data.due }} onClose={() => setPay(false)} onSaved={load} />}
      {bill && <Bill customer={c} bill={bill} onClose={() => setBill(null)} />}
    </div>
  );
}
