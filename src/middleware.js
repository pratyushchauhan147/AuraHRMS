// in src/middleware.js
import { NextResponse } from "next/server";
import * as jose from "jose";

export async function middleware(request) {
  // 1. Get the session token from the user's cookies
  const token = request.cookies.get("session-token")?.value;

  // 2. If no token exists, redirect to the login page
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. If a token exists, verify it
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    await jose.jwtVerify(token, secret);

    // 4. If verification is successful, let the user proceed
    return NextResponse.next();
  } catch (error) {
    // 5. If verification fails, the token is invalid. Redirect to login.
    console.error("JWT Verification Error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// This config object specifies which routes the middleware should run on
export const config = {
  matcher: "/dashboard/:path*", // Protect all routes under /dashboard
};