"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { inr } from "@/lib/format";
import { isHouseCustomer } from "@/lib/shift";

const EMPTY = { name: "", phone: "", address: "", shift: "morning", house: false, openingBalance: "" };

const SHIFT_LABEL = { morning: "☀️ Morning", night: "🌙 Night", both: "☀️🌙 Both" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch("/api/customers");
    const json = await res.json();
    setCustomers(json.customers || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filtered = (customers || []).filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) || (c.phone || "").includes(q)
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">👥 Customers</h1>
      <p className="text-sm text-stone-500">
        Bring every customer over from the manual register — name, phone number and the old
        outstanding amount (opening balance). Daily entries are then recorded in the ledger.
      </p>

      {/* add from manual register */}
      <form onSubmit={add} className="card mt-5 p-5">
        <h2 className="font-display font-bold text-stone-800">
          ➕ Add customer (from the manual register)
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label">Name *</label>
            <input
              className="input"
              placeholder="Ramesh Yadav"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Mobile</label>
            <input
              className="input"
              placeholder="98XXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Address</label>
            <input
              className="input"
              placeholder="Ward 4, Tekari"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Session</label>
            <select
              className="input"
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value })}
            >
              <option value="morning">☀️ Morning</option>
              <option value="night">🌙 Night</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="label">Old balance (₹)</label>
            <input
              type="number"
              className="input"
              placeholder="0"
              value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
            />
          </div>
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            className="h-4 w-4 accent-violet-600"
            checked={form.house}
            onChange={(e) => setForm({ ...form, house: e.target.checked })}
          />
          🏠 Owner&apos;s home account (leftover milk — excluded from sales reports)
        </label>
        {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        <button className="btn-primary mt-4" disabled={saving || !form.name.trim()}>
          {saving ? "Adding…" : "✓ Add customer"}
        </button>
      </form>

      {/* list */}
      <div className="card mt-5 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-stone-100 p-4">
          <input
            className="input max-w-xs"
            placeholder="🔍 Search by name or number…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <p className="text-xs text-stone-400">{filtered.length} customers</p>
        </div>
        {!customers ? (
          <div className="flex justify-center p-12">
            <div className="spinner" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-2.5 w-10">#</th>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Mobile</th>
                  <th className="px-4 py-2.5">Address</th>
                  <th className="px-4 py-2.5">Session</th>
                  <th className="px-4 py-2.5 text-right">Opening</th>
                  <th className="px-4 py-2.5 text-right">Purchased</th>
                  <th className="px-4 py-2.5 text-right">Paid</th>
                  <th className="px-4 py-2.5 text-right">Current Due</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((c, i) => (
                  <tr key={c._id} className={`hover:bg-green-50/40 ${isHouseCustomer(c) ? "bg-violet-50/50" : ""}`}>
                    <td className="px-4 py-3 text-stone-400">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {c.name}
                      {isHouseCustomer(c) && (
                        <span className="ml-2 chip bg-violet-100 text-violet-700">🏠 Home</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-stone-500">{c.address || "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{SHIFT_LABEL[c.shift] || SHIFT_LABEL.both}</td>
                    <td className="px-4 py-3 text-right text-stone-500">{inr(c.openingBalance)}</td>
                    <td className="px-4 py-3 text-right">{inr(c.purchased)}</td>
                    <td className="px-4 py-3 text-right text-green-700">{inr(c.paid)}</td>
                    <td className={`px-4 py-3 text-right font-extrabold ${c.due > 0 ? "text-red-600" : "text-green-700"}`}>
                      {inr(c.due)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/customers/${c._id}`}
                        className="rounded-lg bg-leaf/10 px-3 py-1.5 text-xs font-bold text-leafdark hover:bg-leaf/20"
                      >
                        Open account →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
