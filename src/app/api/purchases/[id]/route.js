import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";

// Undo a wrongly entered purchase: restores stock, then deletes the entry.
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const purchase = await Purchase.findById(id);
  if (!purchase) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  await Promise.all(
    purchase.items.map((i) =>
      Product.updateOne({ _id: i.productId }, { $inc: { stock: i.qty } })
    )
  );
  await purchase.deleteOne();
  return NextResponse.json({ ok: true });
}
