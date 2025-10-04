// in src/app/api/logout/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const response = NextResponse.json({ success: true, message: "Logged out" });

  // Expire the cookie by setting maxAge to -1
  response.cookies.set("session-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: -1,
    path: "/",
  });

  return response;
}