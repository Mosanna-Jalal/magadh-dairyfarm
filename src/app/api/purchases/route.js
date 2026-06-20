import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";
import Customer from "@/models/Customer";

export const dynamic = "force-dynamic";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const q = {};
  if (searchParams.get("customerId")) q.customerId = searchParams.get("customerId");
  if (searchParams.get("date")) q.date = searchParams.get("date");
  const purchases = await Purchase.find(q).sort({ date: -1, createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ purchases });
}

// Body: { customerId, date, items: [{ productId, qty, rate? }], note? }
// Validates stock, records the purchase and decrements available stock.
export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  const { customerId, date, note } = body;
  const shift = body.shift === "night" ? "night" : "morning";
  const rawItems = (body.items || []).filter((i) => Number(i.qty) > 0);

  if (!customerId || !date || rawItems.length === 0) {
    return NextResponse.json(
      { error: "Customer, date and at least one item are required" },
      { status: 400 }
    );
  }
  const customer = await Customer.findById(customerId).lean();
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const products = await Product.find({
    _id: { $in: rawItems.map((i) => i.productId) },
  });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = [];
  for (const raw of rawItems) {
    const product = byId.get(String(raw.productId));
    if (!product) {
      return NextResponse.json({ error: "Unknown product in items" }, { status: 400 });
    }
    const qty = Number(raw.qty);
    if (qty > product.stock) {
      return NextResponse.json(
        {
          error: `Only ${product.stock} ${product.unit} of ${product.name} left — cannot sell ${qty} ${product.unit}.`,
        },
        { status: 400 }
      );
    }
    const rate = raw.rate !== undefined && raw.rate !== "" ? Number(raw.rate) : product.price;
    items.push({
      productId: product._id,
      name: product.name,
      unit: product.unit === "litre" ? "kg" : product.unit, // record in kg going forward
      qty,
      rate,
      amount: Math.round(qty * rate * 100) / 100,
    });
  }

  const total = items.reduce((s, i) => s + i.amount, 0);
  const purchase = await Purchase.create({ customerId, date, shift, items, total, note: note || "" });

  // Deduct sold quantity from available stock
  await Promise.all(
    items.map((i) => Product.updateOne({ _id: i.productId }, { $inc: { stock: -i.qty } }))
  );

  return NextResponse.json({ purchase }, { status: 201 });
}
