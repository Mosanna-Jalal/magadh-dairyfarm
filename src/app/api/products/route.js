import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const products = await Product.find().sort({ sortOrder: 1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  if (!body.name || !body.price) {
    return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
  }
  const slug = (body.slug || body.name).toLowerCase().trim().replace(/\s+/g, "-");
  const product = await Product.create({ ...body, slug });
  return NextResponse.json({ product }, { status: 201 });
}
