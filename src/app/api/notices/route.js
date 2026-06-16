import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notice from "@/models/Notice";
import { dayStr } from "@/lib/format";

export const dynamic = "force-dynamic";

// GET — public. ?all=1 (admin) returns everything; otherwise only active,
// non-expired notices for the website popup.
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  if (searchParams.get("all")) {
    const notices = await Notice.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ notices });
  }
  const today = dayStr();
  const notices = await Notice.find({
    active: true,
    $or: [{ expiresAt: "" }, { expiresAt: { $gte: today } }],
  })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ notices });
}

// POST — admin (middleware enforces auth).
export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const notice = await Notice.create({
    type: body.type === "offer" ? "offer" : "notice",
    title: body.title.trim(),
    message: (body.message || "").trim(),
    expiresAt: body.expiresAt || "",
    active: true,
  });
  return NextResponse.json({ notice }, { status: 201 });
}
