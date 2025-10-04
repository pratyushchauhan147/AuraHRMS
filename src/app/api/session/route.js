// in src/app/api/session/route.js
import { NextResponse } from "next/server";
import * as jose from "jose";

export async function GET(request) {
  const token = request.cookies.get("session-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // Return the user data from the token's payload
    return NextResponse.json({ user: payload });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}