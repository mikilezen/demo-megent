import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "./lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname === "/login" && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if ((pathname === "/" || pathname.startsWith("/setting")) && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/setting/:path*"],
};