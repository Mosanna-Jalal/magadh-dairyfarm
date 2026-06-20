// Shared formatting helpers (₹ / dates) usable on server and client.

export function inr(n) {
  const v = Number(n || 0);
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// Round to at most 3 decimals (trims trailing zeros: 62, 62.5, 62.125).
export function round3(n) {
  return Math.round((Number(n) || 0) * 1000) / 1000;
}

// All quantities are in kg now; legacy "litre" data is treated as kg (1L = 1kg).
export function unitLabel(u) {
  return u === "litre" ? "kg" : u || "kg";
}

// Local date as "YYYY-MM-DD"
export function dayStr(d = new Date()) {
  return new Date(d).toLocaleDateString("en-CA");
}

export function addDays(day, n) {
  const d = new Date(day + "T12:00:00");
  d.setDate(d.getDate() + n);
  return dayStr(d);
}

export function listDays(from, to) {
  const out = [];
  let cur = from;
  while (cur <= to) {
    out.push(cur);
    cur = addDays(cur, 1);
    if (out.length > 120) break; // safety
  }
  return out;
}

export function prettyDay(day) {
  const d = new Date(day + "T12:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function weekDay(day) {
  const d = new Date(day + "T12:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short" });
}

export function prettyDate(day) {
  const d = new Date(day + "T12:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Month helpers (for ledger filters & sales report) ──────────────
export function listMonths(from, to) {
  const out = [];
  let cur = from.slice(0, 7);
  const end = to.slice(0, 7);
  while (cur <= end) {
    out.push(cur);
    const d = new Date(cur + "-01T12:00:00");
    d.setMonth(d.getMonth() + 1);
    cur = dayStr(d).slice(0, 7);
    if (out.length > 60) break; // safety
  }
  return out;
}

export function monthLabel(ym) {
  const d = new Date(ym + "-01T12:00:00");
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function monthStart(day) {
  return day.slice(0, 7) + "-01";
}

export function monthEnd(day) {
  const [y, m] = day.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${day.slice(0, 7)}-${String(last).padStart(2, "0")}`;
}

export function addMonths(day, n) {
  const [y, m] = day.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return dayStr(d);
}
