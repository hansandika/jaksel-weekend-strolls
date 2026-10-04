import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidSessionCookie } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.ADMIN_SECRET;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authed = await isValidSessionCookie(token, secret);

  if (pathname === "/admin") {
    if (authed && request.method === "GET") {
      return NextResponse.redirect(new URL("/admin/queue", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!authed) {
      const login = new URL("/admin", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
