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
  const product = await Product.findByIdAndUpdate(id, allowed, { new: true });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}
