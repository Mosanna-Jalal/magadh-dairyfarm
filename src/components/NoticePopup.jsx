"use client";

import { useEffect, useState } from "react";

// Fetches active notices/offers and shows them as a dismissible popup.
// Dismissals are remembered per-id (localStorage) so a closed notice stays
// closed across reloads, but a NEW notice still appears.
export default function NoticePopup() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notices")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        let dismissed = [];
        try {
          dismissed = JSON.parse(localStorage.getItem("dismissedNotices") || "[]");
        } catch {}
        const pending = (json.notices || []).filter((n) => !dismissed.includes(n._id));
        setQueue(pending);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (queue.length === 0) return null;
  const n = queue[0];
  const isOffer = n.type === "offer";

  function dismiss() {
    try {
      const dismissed = JSON.parse(localStorage.getItem("dismissedNotices") || "[]");
      dismissed.push(n._id);
      localStorage.setItem("dismissedNotices", JSON.stringify(dismissed));
    } catch {}
    setQueue((q) => q.slice(1));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-fade-up ${
          isOffer ? "ring-2 ring-amber-400" : "ring-2 ring-leaf/40"
        }`}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-stone-600 transition hover:bg-black/20"
        >
          ✕
        </button>

        <div
          className={`px-6 py-5 text-white ${
            isOffer
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-leafdark to-leaf"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-widest opacity-90">
            {isOffer ? "🎉 Special Offer" : "📢 Notice"}
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold">{n.title}</h3>
        </div>

        <div className="px-6 py-5">
          {n.message && <p className="text-sm leading-relaxed text-stone-600">{n.message}</p>}
          <button
            onClick={dismiss}
            className={`mt-5 w-full justify-center btn ${
              isOffer ? "bg-amber-500 text-white hover:bg-amber-600" : "btn-primary"
            }`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
