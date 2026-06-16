"use client";

import { useEffect, useState } from "react";
import { prettyDate, dayStr } from "@/lib/format";

const EMPTY = { type: "notice", title: "", message: "", expiresAt: "" };

export default function NoticesPage() {
  const [notices, setNotices] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const today = dayStr();

  async function load() {
    const res = await fetch("/api/notices?all=1");
    const json = await res.json();
    setNotices(json.notices || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/notices", {
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

  async function toggle(n) {
    await fetch(`/api/notices/${n._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !n.active }),
    });
    load();
  }

  async function remove(n) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/notices/${n._id}`, { method: "DELETE" });
    load();
  }

  const isExpired = (n) => n.expiresAt && n.expiresAt < today;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">📢 Notices &amp; Offers</h1>
      <p className="text-sm text-stone-500">
        Post a notice or special offer. It pops up on the website until it expires (or you turn it
        off). Visitors can close it with the ✕ button.
      </p>

      <form onSubmit={add} className="card mt-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="notice">📢 Notice</option>
              <option value="offer">🎉 Offer</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="label">Title *</label>
            <input
              className="input"
              placeholder={form.type === "offer" ? "Diwali Special — 10% off ghee!" : "No delivery on Sunday"}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Expiry date (optional)</label>
            <input
              type="date"
              className="input"
              min={today}
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <div className="lg:col-span-4">
            <label className="label">Message</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Write the details shown in the popup…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
        </div>
        {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        <button className="btn-primary mt-4" disabled={saving || !form.title.trim()}>
          {saving ? "Posting…" : "✓ Post to website"}
        </button>
      </form>

      <div className="card mt-5 overflow-hidden">
        {!notices ? (
          <div className="flex justify-center p-12">
            <div className="spinner" />
          </div>
        ) : notices.length === 0 ? (
          <p className="p-8 text-center text-sm text-stone-400">Nothing posted yet.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {notices.map((n) => (
              <div key={n._id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-stone-800">
                    <span>{n.type === "offer" ? "🎉" : "📢"}</span>
                    {n.title}
                    {!n.active && <span className="chip bg-stone-200 text-stone-600">Off</span>}
                    {isExpired(n) && <span className="chip bg-red-100 text-red-700">Expired</span>}
                    {n.active && !isExpired(n) && (
                      <span className="chip bg-green-100 text-green-700">Live</span>
                    )}
                  </p>
                  {n.message && <p className="mt-0.5 text-sm text-stone-500">{n.message}</p>}
                  <p className="mt-1 text-[11px] text-stone-400">
                    {n.expiresAt ? `Expires ${prettyDate(n.expiresAt)}` : "No expiry"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => toggle(n)}
                    className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200"
                  >
                    {n.active ? "Turn off" : "Turn on"}
                  </button>
                  <button
                    onClick={() => remove(n)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
