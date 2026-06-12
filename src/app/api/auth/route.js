import { NextResponse } from "next/server";

const PASSWORD = process.env.ADMIN_PASSWORD || "faizan123";

export async function POST(request) {
  const { password } = await request.json();
  if (password !== PASSWORD) {
    return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", PASSWORD, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
