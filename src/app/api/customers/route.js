import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { totalsByCustomer, dueOf } from "@/lib/ledger";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const [customers, totals] = await Promise.all([
    Customer.find().sort({ name: 1 }).lean(),
    totalsByCustomer(),
  ]);
  const withDues = customers.map((c) => ({ ...c, ...dueOf(c, totals) }));
  return NextResponse.json({ customers: withDues });
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
  }
  const phone = (body.phone || "").trim();
  // mobile number must be unique (empty allowed for customers without a phone)
  if (phone) {
    const dup = await Customer.findOne({ phone }).lean();
    if (dup) {
      return NextResponse.json(
        { error: `A customer with mobile ${phone} already exists (${dup.name}).` },
        { status: 409 }
      );
    }
  }
  const customer = await Customer.create({
    name: body.name.trim(),
    phone,
    address: (body.address || "").trim(),
    shift: ["morning", "night", "both"].includes(body.shift) ? body.shift : "both",
    house: Boolean(body.house),
    openingBalance: Number(body.openingBalance || 0),
    note: body.note || "",
  });
  return NextResponse.json({ customer }, { status: 201 });
}
