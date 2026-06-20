import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function PATCH(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const body = await request.json();
  const allowed = {};
  for (const k of ["stock", "price", "lowStockAt", "name", "nameHindi", "description", "unit"]) {
    if (body[k] !== undefined) allowed[k] = body[k];
  }
  // keep stock to at most 3 decimal places
  if (allowed.stock !== undefined) allowed.stock = Math.round((Number(allowed.stock) || 0) * 1000) / 1000;
  const product = await Product.findByIdAndUpdate(id, allowed, { new: true });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}
