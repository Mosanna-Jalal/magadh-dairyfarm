import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";
import Product from "@/models/Product";
import { totalsByCustomer, dueOf } from "@/lib/ledger";
import { dayStr } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const today = dayStr();
  const [customers, totals, todayPurchases, todayPayments, products] = await Promise.all([
    Customer.find({ active: true }).lean(),
    totalsByCustomer(),
    Purchase.find({ date: today }).lean(),
    Payment.find({ date: today }).lean(),
    Product.find().sort({ sortOrder: 1 }).lean(),
  ]);

  const dues = customers
    .map((c) => ({ _id: c._id, name: c.name, phone: c.phone, ...dueOf(c, totals) }))
    .sort((a, b) => b.due - a.due);
  const totalDue = dues.reduce((s, c) => s + Math.max(0, c.due), 0);

  const todaySales = todayPurchases.reduce((s, p) => s + p.total, 0);
  const todayCollection = todayPayments.reduce((s, p) => s + p.amount, 0);

  const outOfStock = products.filter((p) => p.stock <= 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockAt);

  return NextResponse.json({
    today,
    totalDue,
    todaySales,
    todayEntries: todayPurchases.length,
    todayCollection,
    customerCount: customers.length,
    topDues: dues.slice(0, 6),
    products,
    outOfStock,
    lowStock,
  });
}
