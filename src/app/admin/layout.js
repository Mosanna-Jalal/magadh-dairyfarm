"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/ledger", label: "Daily Ledger", icon: "📒" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/stock", label: "Stock", icon: "📦" },
  { href: "/admin/reports", label: "Sales Report", icon: "📈" },
  { href: "/admin/backup", label: "Backup & Export", icon: "💾" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return children;

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-stone-100 lg:flex">
      {/* sidebar */}
      <aside className="lg:fixed lg:inset-y-0 lg:w-60 z-20 flex flex-col border-b border-stone-200 bg-leafdark text-green-50 lg:border-b-0">
        <Link href="/" className="flex items-center gap-2 px-5 py-4">
          <span className="text-2xl">🐄</span>
          <div className="leading-tight">
            <p className="font-display font-bold">Magadh Farm &amp; Dairy</p>
            <p className="text-[10px] uppercase tracking-widest text-green-300">Admin Panel</p>
          </div>
        </Link>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-white/15 text-white" : "text-green-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{n.icon}</span> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden flex-col gap-1 p-3 lg:flex">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-200 hover:bg-white/10 hover:text-white"
          >
            🌐 View website
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-green-200 hover:bg-white/10 hover:text-white"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-60">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
