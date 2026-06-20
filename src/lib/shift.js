// Default session by time of day: 5:00am–3:59pm = morning, otherwise night.
export function defaultShift(d = new Date()) {
  const h = d.getHours();
  return h >= 5 && h < 16 ? "morning" : "night";
}

// "House" accounts = owner's home accounts for leftover milk (Home Morning /
// Home Night). Excluded from sales graphs and shown specially in the ledger.
const HOUSE_RE = /home\s*(morning|night)/i;

export function isHouseName(name) {
  return HOUSE_RE.test(name || "");
}

export function isHouseCustomer(c) {
  if (!c) return false;
  return Boolean(c.house) || HOUSE_RE.test(c.name || "");
}
