import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";

// Returns Map<customerId, { purchased, paid }> across all time.
export async function totalsByCustomer() {
  const [pur, pay] = await Promise.all([
    Purchase.aggregate([{ $group: { _id: "$customerId", total: { $sum: "$total" } } }]),
    Payment.aggregate([{ $group: { _id: "$customerId", total: { $sum: "$amount" } } }]),
  ]);
  const map = new Map();
  for (const p of pur) map.set(String(p._id), { purchased: p.total, paid: 0 });
  for (const p of pay) {
    const k = String(p._id);
    const cur = map.get(k) || { purchased: 0, paid: 0 };
    cur.paid = p.total;
    map.set(k, cur);
  }
  return map;
}

export function dueOf(customer, totals) {
  const t = totals.get(String(customer._id)) || { purchased: 0, paid: 0 };
  return {
    purchased: t.purchased,
    paid: t.paid,
    due: (customer.openingBalance || 0) + t.purchased - t.paid,
  };
}
