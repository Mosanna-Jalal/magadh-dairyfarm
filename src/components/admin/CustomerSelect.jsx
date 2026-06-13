"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Searchable customer picker — type to filter by name / phone / address.
// Crucial when several customers share the same name.
export default function CustomerSelect({ customers, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef(null);
  const selected = customers.find((c) => String(c._id) === String(value));

  useEffect(() => {
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.phone || "").includes(s) ||
        (c.address || "").toLowerCase().includes(s)
    );
  }, [q, customers]);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="truncate">
          {selected ? (
            <>
              <span className="font-medium text-stone-800">{selected.name}</span>
              {selected.address ? <span className="text-stone-400"> · {selected.address}</span> : null}
            </>
          ) : (
            <span className="text-stone-400">Select customer…</span>
          )}
        </span>
        <span className="shrink-0 text-stone-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl">
          <div className="p-2">
            <input
              autoFocus
              className="input"
              placeholder="🔍 Search name / phone / address"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-sm text-stone-400">No matching customer</p>
            )}
            {filtered.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => {
                  onChange(c._id);
                  setOpen(false);
                  setQ("");
                }}
                className={`flex w-full flex-col items-start px-3 py-2 text-left transition hover:bg-leaf/10 ${
                  String(c._id) === String(value) ? "bg-leaf/5" : ""
                }`}
              >
                <span className="text-sm font-semibold text-stone-800">{c.name}</span>
                <span className="text-[11px] text-stone-400">
                  {[c.phone, c.address].filter(Boolean).join(" · ") || "—"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
