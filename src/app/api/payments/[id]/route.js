import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const payment = await Payment.findByIdAndDelete(id);
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
