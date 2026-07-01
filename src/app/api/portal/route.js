import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

// Public, read-only: customers look up their own account by phone number.
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const phone = (searchParams.get("phone") || "").replace(/\D/g, "");
  if (phone.length < 10) {
    return NextResponse.json({ error: "Please enter your 10-digit mobile number." }, { status: 400 });
  }
  const customer = await Customer.findOne({ phone: new RegExp(phone + "$") }).lean();
  if (!customer) {
    return NextResponse.json(
      { error: "No account found for this number. Please contact the farm to get registered." },
      { status: 404 }
    );
  }
  const [purchases, payments, products] = await Promise.all([
    Purchase.find({ customerId: customer._id }).sort({ date: -1, createdAt: -1 }).limit(60).lean(),
    Payment.find({ customerId: customer._id }).sort({ date: -1, createdAt: -1 }).limit(30).lean(),
    Product.find({ showOnSite: { $ne: false } }).sort({ sortOrder: 1 }).lean(),
  ]);
  const [purAgg, payAgg] = await Promise.all([
    Purchase.aggregate([
      { $match: { customerId: customer._id } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Payment.aggregate([
      { $match: { customerId: customer._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);
  const purchased = purAgg[0]?.total || 0;
  const paid = payAgg[0]?.total || 0;
  const due = (customer.openingBalance || 0) + purchased - paid;

  // Optional date-range bill (customer generates their own invoice)
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  let bill = null;
  if (from && to) {
    const [bp, bpay, beforePur, beforePay] = await Promise.all([
      Purchase.find({ customerId: customer._id, date: { $gte: from, $lte: to } })
        .sort({ date: 1, createdAt: 1 })
        .lean(),
      Payment.find({ customerId: customer._id, date: { $gte: from, $lte: to } })
        .sort({ date: 1, createdAt: 1 })
        .lean(),
      Purchase.aggregate([
        { $match: { customerId: customer._id, date: { $lt: from } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Payment.aggregate([
        { $match: { customerId: customer._id, date: { $lt: from } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);
    // running balance carried into the period (opening + everything before `from`)
    const previousBalance =
      (customer.openingBalance || 0) + (beforePur[0]?.total || 0) - (beforePay[0]?.total || 0);
    bill = {
      from,
      to,
      previousBalance,
      purchases: bp,
      payments: bpay,
      purchased: bp.reduce((s, p) => s + p.total, 0),
      paid: bpay.reduce((s, p) => s + p.amount, 0),
    };
  }

  return NextResponse.json({
    customer: { name: customer.name, phone: customer.phone, address: customer.address, openingBalance: customer.openingBalance },
    purchases,
    payments,
    purchased,
    paid,
    due,
    products,
    bill,
  });
}
