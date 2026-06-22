"use client";

import { useEffect, useState } from "react";
import { round3, unitLabel } from "@/lib/format";
import ProductIcon from "@/components/ProductIcon";

function ProductRow({ p, onSaved }) {
  const [name, setName] = useState(p.name);
  const [stock, setStock] = useState(round3(p.stock));
  const [price, setPrice] = useState(p.price);
  const [lowStockAt, setLowStockAt] = useState(p.lowStockAt);
  const [showOnSite, setShowOnSite] = useState(p.showOnSite !== false);
  const [saving, setSaving] = useState(false);
  const dirty =
    name !== p.name ||
    Number(stock) !== p.stock ||
    Number(price) !== p.price ||
    Number(lowStockAt) !== p.lowStockAt ||
    showOnSite !== (p.showOnSite !== false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    await fetch(`/api/products/${p._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        stock: round3(stock),
        price: Number(price),
        lowStockAt: Number(lowStockAt),
        showOnSite,
      }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <tr className={`hover:bg-green-50/40 ${showOnSite ? "" : "bg-stone-50/60"}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <ProductIcon slug={p.slug} className="h-6 w-6 shrink-0" />
          <div className="min-w-0">
            <input
              className="input w-36 !py-1.5 font-semibold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
            />
            <p className="mt-0.5 text-[11px] text-stone-400">
              {p.nameHindi ? `${p.nameHindi} · ` : ""}per {unitLabel(p.unit)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {p.stock <= 0 ? (
          <span className="chip bg-red-100 text-red-700">Out of stock ❌</span>
        ) : p.stock <= p.lowStockAt ? (
          <span className="chip bg-amber-100 text-amber-700">Running low ⚠️</span>
        ) : (
          <span className="chip bg-green-100 text-green-700">In stock ✅</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            step="0.25"
            className="input w-24 text-center font-bold"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <span className="text-xs text-stone-400">{unitLabel(p.unit)}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-400">₹</span>
          <input
            type="number"
            min="0"
            className="input w-20 text-center"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min="0"
          className="input w-16 text-center"
          value={lowStockAt}
          onChange={(e) => setLowStockAt(e.target.value)}
          title="Low-stock alert threshold"
        />
      </td>
      <td className="px-4 py-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-stone-600">
          <input
            type="checkbox"
            className="h-4 w-4 accent-leaf"
            checked={showOnSite}
            onChange={(e) => setShowOnSite(e.target.checked)}
          />
          {showOnSite ? "Shown" : "Hidden"}
        </label>
      </td>
      <td className="px-4 py-3 text-right">
        <button className="btn-primary !px-4 !py-1.5 text-xs" onClick={save} disabled={!dirty || saving}>
          {saving ? "…" : "✓ Save"}
        </button>
      </td>
    </tr>
  );
}

export default function StockPage() {
  const [products, setProducts] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", nameHindi: "", unit: "kg", price: "", stock: "", emoji: "🧈", sortOrder: 10, showOnSite: true });

  async function load() {
    const res = await fetch("/api/products");
    const json = await res.json();
    setProducts(json.products || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function addProduct(e) {
    e.preventDefault();
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        sortOrder: Number(form.sortOrder || 10),
      }),
    });
    setShowAdd(false);
    setForm({ name: "", nameHindi: "", unit: "kg", price: "", stock: "", emoji: "🧈", sortOrder: 10, showOnSite: true });
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">📦 Stock &amp; Availability</h1>
          <p className="text-sm text-stone-500">
            Enter the day&apos;s available stock after milking. It reduces automatically as sales
            are recorded, and the website shows live availability to customers.
          </p>
        </div>
        <button className="btn-ghost" onClick={() => setShowAdd(!showAdd)}>
          ＋ New product
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addProduct} className="card mt-4 grid gap-3 p-5 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Hindi name</label>
            <input className="input" value={form.nameHindi} onChange={(e) => setForm({ ...form, nameHindi: e.target.value })} />
          </div>
          <div>
            <label className="label">Unit</label>
            <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              <option value="kg">kg</option>
              <option value="piece">piece</option>
            </select>
          </div>
          <div>
            <label className="label">Rate (₹) *</label>
            <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-600 sm:col-span-3 lg:col-span-5">
            <input
              type="checkbox"
              className="h-4 w-4 accent-leaf"
              checked={form.showOnSite}
              onChange={(e) => setForm({ ...form, showOnSite: e.target.checked })}
            />
            Show this product on the website homepage
          </label>
          <div className="flex items-end">
            <button className="btn-primary w-full justify-center" disabled={!form.name || !form.price}>
              ✓ Add
            </button>
          </div>
        </form>
      )}

      <div className="card mt-5 overflow-x-auto">
        {!products ? (
          <div className="flex justify-center p-12">
            <div className="spinner" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Available today</th>
                <th className="px-4 py-2.5">Rate</th>
                <th className="px-4 py-2.5">Alert level</th>
                <th className="px-4 py-2.5">Website</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <ProductRow key={p._id} p={p} onSaved={load} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-xs text-stone-400">
        💡 The stock you save is the total currently available (to restock, enter the new figure).
        Recording a sale reduces it automatically; deleting an entry adds it back. Untick
        &ldquo;Website&rdquo; to track a product privately without showing it on the homepage.
      </p>
    </div>
  );
}
