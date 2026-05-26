import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

import type { SessionPayload } from "@/lib/auth/session";
import { getPostAuthPath } from "@/lib/auth/redirect";

const COOKIE_NAME = "team_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function getSession(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = getSecret();
  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession(request);
  const isLoggedIn = Boolean(session);

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (isLoggedIn) {
      const from = request.nextUrl.searchParams.get("from");
      const destination = getPostAuthPath(
        session!.isAdmin === true,
        from,
      );
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  const publicAuthApi =
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/session") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/api/auth/departments");

  if (publicAuthApi) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (pathname.startsWith("/admin")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", "/admin");
      return NextResponse.redirect(loginUrl);
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
