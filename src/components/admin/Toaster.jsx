"use client";

import { useEffect, useState } from "react";

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onToast(e) {
      const t = e.detail;
      setToasts((list) => [...list, t]);
      setTimeout(() => {
        setToasts((list) => list.filter((x) => x.id !== t.id));
      }, 4500);
    }
    window.addEventListener("app-toast", onToast);
    return () => window.removeEventListener("app-toast", onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg animate-fade-up ${
            t.type === "error"
              ? "bg-red-600 text-white"
              : t.type === "success"
              ? "bg-leaf text-white"
              : "bg-stone-800 text-white"
          }`}
        >
          <span>{t.type === "error" ? "⚠️" : t.type === "success" ? "✓" : "ℹ️"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
