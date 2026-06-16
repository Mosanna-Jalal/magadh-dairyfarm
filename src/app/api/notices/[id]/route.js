import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notice from "@/models/Notice";

export async function PATCH(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const body = await request.json();
  const allowed = {};
  for (const k of ["title", "message", "type", "active", "expiresAt"]) {
    if (body[k] !== undefined) allowed[k] = body[k];
  }
  const notice = await Notice.findByIdAndUpdate(id, allowed, { new: true });
  if (!notice) return NextResponse.json({ error: "Notice not found" }, { status: 404 });
  return NextResponse.json({ notice });
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const notice = await Notice.findByIdAndDelete(id);
  if (!notice) return NextResponse.json({ error: "Notice not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
