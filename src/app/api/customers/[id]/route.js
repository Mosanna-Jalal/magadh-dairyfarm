import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const customer = await Customer.findById(id).lean();
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const [purchases, payments] = await Promise.all([
    Purchase.find({ customerId: id }).sort({ date: -1, createdAt: -1 }).lean(),
    Payment.find({ customerId: id }).sort({ date: -1, createdAt: -1 }).lean(),
  ]);
  const purchased = purchases.reduce((s, p) => s + p.total, 0);
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const due = (customer.openingBalance || 0) + purchased - paid;

  return NextResponse.json({ customer, purchases, payments, purchased, paid, due });
}

export async function PATCH(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const body = await request.json();
  const allowed = {};
  for (const k of ["name", "phone", "address", "shift", "house", "openingBalance", "active", "note"]) {
    if (body[k] !== undefined) allowed[k] = body[k];
  }
  // keep mobile numbers unique across customers
  if (allowed.phone) {
    const phone = String(allowed.phone).trim();
    allowed.phone = phone;
    if (phone) {
      const dup = await Customer.findOne({ phone, _id: { $ne: id } }).lean();
      if (dup) {
        return NextResponse.json(
          { error: `Another customer already uses mobile ${phone} (${dup.name}).` },
          { status: 409 }
        );
      }
    }
  }
  const customer = await Customer.findByIdAndUpdate(id, allowed, { new: true });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ customer });
}
