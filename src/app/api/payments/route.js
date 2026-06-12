import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Customer from "@/models/Customer";

export const dynamic = "force-dynamic";

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  const { customerId, date, amount, mode, note } = body;
  if (!customerId || !date || !Number(amount)) {
    return NextResponse.json({ error: "Customer, date and amount are required" }, { status: 400 });
  }
  const customer = await Customer.findById(customerId).lean();
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const payment = await Payment.create({
    customerId,
    date,
    amount: Number(amount),
    mode: mode || "cash",
    note: note || "",
  });
  return NextResponse.json({ payment }, { status: 201 });
}
