// Shared formatting helpers (₹ / dates) usable on server and client.

export function inr(n) {
  const v = Number(n || 0);
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
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
