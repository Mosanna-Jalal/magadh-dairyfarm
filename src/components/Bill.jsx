"use client";

import { inr, prettyDate, unitLabel } from "@/lib/format";

const OWNER_WHATSAPP = "9973807755";

// A printable, PDF-ready invoice for a date range. "Save as PDF" uses the
// browser's print dialog (print CSS isolates #printable-bill).
export default function Bill({ customer, bill, onClose }) {
  const net = (bill.purchased || 0) - (bill.paid || 0);
  const billNo = `${(customer.phone || "0000").slice(-4)}-${bill.from.replace(/-/g, "").slice(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-6">
      {/* action bar (not printed) */}
      <div className="no-print fixed right-4 top-4 z-10 flex gap-2">
        <button onClick={() => window.print()} className="btn-primary shadow-lg">
          ⬇ Save as PDF
        </button>
        <button onClick={onClose} className="btn bg-white text-stone-700 shadow-lg hover:bg-stone-100">
          ✕ Close
        </button>
      </div>

      <div
        id="printable-bill"
        className="my-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-10"
      >
        {/* header */}
        <div className="flex items-start justify-between border-b-2 border-leaf/30 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐄</span>
            <div>
              <p className="font-display text-xl font-bold text-leafdark">Magadh Farm &amp; Dairy Products</p>
              <p className="text-xs text-stone-500">Pure • Fresh • Village Made — Magadh, Bihar</p>
              <p className="mt-0.5 text-xs text-stone-500">📱 WhatsApp: {OWNER_WHATSAPP}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold tracking-wide text-stone-800">BILL</p>
            <p className="text-[11px] text-stone-400">No. {billNo}</p>
          </div>
        </div>

        {/* meta */}
        <div className="mt-5 flex flex-wrap justify-between gap-4 text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Billed to</p>
            <p className="font-bold text-stone-800">{customer.name}</p>
            {customer.phone && <p className="text-stone-500">📞 {customer.phone}</p>}
            {customer.address && <p className="text-stone-500">{customer.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Period</p>
            <p className="font-semibold text-stone-700">
              {prettyDate(bill.from)} — {prettyDate(bill.to)}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Generated {prettyDate(new Date().toLocaleDateString("en-CA"))}</p>
          </div>
        </div>

        {/* purchases table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-leafdark text-left text-white">
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Items</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bill.purchases.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-stone-400">
                    No purchases in this period.
                  </td>
                </tr>
              )}
              {bill.purchases.map((p) => (
                <tr key={p._id}>
                  <td className="whitespace-nowrap px-3 py-2 text-stone-500">
                    {prettyDate(p.date)}{" "}
                    <span className="text-[10px]">{p.shift === "night" ? "🌙" : "☀️"}</span>
                  </td>
                  <td className="px-3 py-2 text-stone-700">
                    {p.items.map((i) => `${i.name} ${i.qty}${unitLabel(i.unit)}`).join(", ")}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-stone-800">{inr(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* payments in period */}
        {bill.payments.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              Payments in this period
            </p>
            <div className="mt-1 space-y-1">
              {bill.payments.map((p) => (
                <div key={p._id} className="flex justify-between text-sm text-stone-600">
                  <span>
                    {prettyDate(p.date)} <span className="uppercase text-stone-400">({p.mode})</span>
                  </span>
                  <span className="font-semibold text-green-700">− {inr(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* totals — for the selected period only */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Purchases (this period)</span>
              <span className="font-semibold text-stone-800">{inr(bill.purchased)}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-500">Paid (this period)</span>
              <span className="font-semibold text-green-700">− {inr(bill.paid)}</span>
            </div>
            <div className="mt-1 flex justify-between rounded-lg bg-amber-50 px-3 py-2.5">
              <span className="font-bold text-amber-800">
                {net > 0 ? "Amount due (this period)" : "Balance (this period)"}
              </span>
              <span className={`font-extrabold ${net > 0 ? "text-red-600" : "text-green-700"}`}>
                {inr(net)}
              </span>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="mt-8 border-t border-stone-200 pt-4 text-center">
          <p className="font-display text-base font-bold text-leafdark">Thank you for choosing us! 🙏</p>
          <p className="mt-1 text-[11px] text-stone-400">
            This is a computer-generated bill from Magadh Farm &amp; Dairy Products. For any query,
            WhatsApp {OWNER_WHATSAPP}.
          </p>
        </div>
      </div>
    </div>
  );
}
