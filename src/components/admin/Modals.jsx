"use client";

import { useMemo, useState } from "react";
import { inr, dayStr } from "@/lib/format";
import ProductIcon from "@/components/ProductIcon";
import CustomerSelect from "@/components/admin/CustomerSelect";

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-stone-900">{title}</h3>
            {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:bg-stone-100">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Record a purchase (milk first, stock-aware) ─────────────────
export function EntryModal({ customers, products, preset = {}, onClose, onSaved }) {
  const [customerId, setCustomerId] = useState(preset.customerId || customers[0]?._id || "");
  const [date, setDate] = useState(preset.date || dayStr());
  const [shift, setShift] = useState(preset.shift === "night" ? "night" : "morning");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [lines, setLines] = useState(() =>
    products.map((p) => ({ productId: p._id, qty: "", rate: p.price }))
  );

  const total = useMemo(
    () =>
      lines.reduce((s, l) => {
        const q = Number(l.qty) || 0;
        return s + q * (Number(l.rate) || 0);
      }, 0),
    [lines]
  );

  function setLine(i, patch) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  async function save() {
    setError("");
    const items = lines.filter((l) => Number(l.qty) > 0);
    if (!customerId) return setError("Please select a customer");
    if (items.length === 0) return setError("Enter a quantity for at least one item");
    setSaving(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, date, shift, note, items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save the entry");
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const customer = customers.find((c) => String(c._id) === String(customerId));

  return (
    <ModalShell
      title="✍️ New Entry"
      subtitle={customer ? `Account: ${customer.name}` : ""}
      onClose={onClose}
    >
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="label">Customer</label>
          <CustomerSelect customers={customers} value={customerId} onChange={setCustomerId} />
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {/* session (morning / night) */}
      <div className="mt-3">
        <label className="label">Session</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["morning", "☀️ Morning"],
            ["night", "🌙 Night"],
          ].map(([val, lbl]) => (
            <button
              key={val}
              type="button"
              onClick={() => setShift(val)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                shift === val
                  ? "border-leaf bg-leaf text-white"
                  : "border-stone-300 bg-white text-stone-600 hover:border-leaf"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* column headers */}
      <div className="mt-4 flex items-center gap-3 px-3 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
        <span className="w-7 shrink-0" />
        <span className="grow">Item</span>
        <span className="w-20 text-center">Qty</span>
        <span className="w-20 text-center">Rate (₹)</span>
        <span className="w-16 text-right">Amount</span>
      </div>

      <div className="mt-1 space-y-2">
        {products.map((p, i) => {
          const line = lines[i];
          const qty = Number(line.qty) || 0;
          const over = qty > p.stock;
          const amount = qty * (Number(line.rate) || 0);
          return (
            <div
              key={p._id}
              className={`rounded-xl border p-3 ${
                qty > 0 ? "border-leaf/60 bg-green-50/50" : "border-stone-200"
              } ${p.stock <= 0 ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3">
                <ProductIcon slug={p.slug} className="h-7 w-7 shrink-0" />
                <div className="min-w-0 grow">
                  <p className="text-sm font-bold text-stone-800">
                    {p.name}{" "}
                    <span className="text-[11px] font-medium text-stone-400">
                      {inr(p.price)}/{p.unit}
                    </span>
                  </p>
                  <p className={`text-[11px] font-medium ${
                    p.stock <= 0 ? "text-red-600" : p.stock <= p.lowStockAt ? "text-amber-600" : "text-green-700"
                  }`}>
                    {p.stock <= 0 ? "Out of stock ❌" : `${p.stock} ${p.unit} available`}
                  </p>
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    placeholder="Qty"
                    disabled={p.stock <= 0}
                    className={`input text-center ${over ? "!border-red-400 !ring-red-200" : ""}`}
                    value={line.qty}
                    onChange={(e) => setLine(i, { qty: e.target.value })}
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    min="0"
                    className="input text-center"
                    title="Rate (₹)"
                    value={line.rate}
                    onChange={(e) => setLine(i, { rate: e.target.value })}
                  />
                </div>
                <p className="w-16 text-right text-sm font-bold text-stone-700">
                  {qty > 0 ? inr(amount) : "—"}
                </p>
              </div>
              {over && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">
                  Only {p.stock} {p.unit} left!
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        <input
          className="input"
          placeholder="Note (optional) — e.g. evening delivery"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
        <p className="text-lg font-bold text-stone-900">
          Total: <span className="text-leafdark">{inr(total)}</span>
        </p>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "✓ Save entry"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Record a payment ─────────────────────────────────────────────
export function PayModal({ customer, onClose, onSaved }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(dayStr());
  const [mode, setMode] = useState("cash");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setError("");
    if (!Number(amount)) return setError("Please enter the amount");
    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer._id, date, amount, mode, note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save the payment");
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title="💵 Record Payment"
      subtitle={`${customer.name}${customer.due !== undefined ? ` — current due: ${inr(customer.due)}` : ""}`}
      onClose={onClose}
    >
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Amount received (₹)</label>
          <input
            type="number"
            min="0"
            autoFocus
            className="input text-xl font-bold"
            placeholder="500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {customer.due > 0 && (
            <button
              type="button"
              onClick={() => setAmount(String(customer.due))}
              className="mt-1 text-xs font-semibold text-leaf hover:underline"
            >
              Use full due: {inr(customer.due)}
            </button>
          )}
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Payment mode</label>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="col-span-2">
          <input
            className="input"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      <div className="mt-4 flex justify-end gap-2 border-t border-stone-100 pt-4">
        <button className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "✓ Save payment"}
        </button>
      </div>
    </ModalShell>
  );
}
