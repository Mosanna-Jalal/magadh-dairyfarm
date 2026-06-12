"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-leafdark to-leaf p-5">
      <form onSubmit={submit} className="card w-full max-w-sm p-7">
        <div className="text-center">
          <span className="text-4xl">🐄</span>
          <h1 className="mt-2 font-display text-2xl font-bold text-stone-900">Admin Login</h1>
          <p className="text-xs text-stone-500">Magadh Dairy Farm — authorized access only</p>
        </div>
        <div className="mt-6">
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
          />
        </div>
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <button className="btn-primary mt-5 w-full justify-center" disabled={loading || !password}>
          {loading ? "Signing in…" : "Sign in →"}
        </button>
        <Link href="/" className="mt-4 block text-center text-xs text-stone-400 hover:text-leaf">
          ← Back to website
        </Link>
      </form>
    </main>
  );
}
