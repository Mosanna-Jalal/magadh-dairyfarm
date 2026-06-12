import { NextResponse } from "next/server";

const PASSWORD = process.env.ADMIN_PASSWORD || "faizan123";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.get("admin_auth")?.value === PASSWORD;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!authed) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    // Public endpoints: login, customer portal, product availability (read-only)
    if (pathname.startsWith("/api/auth")) return NextResponse.next();
    if (pathname.startsWith("/api/portal")) return NextResponse.next();
    if (pathname.startsWith("/api/products") && request.method === "GET") return NextResponse.next();
    if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
