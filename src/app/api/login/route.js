// in src/app/api/login/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import * as jose from "jose";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 2. Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

 
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const alg = "HS256";

    const token = await new jose.SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg })
      .setExpirationTime("2h") // Token expires in 2 hours
      .setIssuedAt()
      .sign(secret);

    // 4. Set the token in a secure, httpOnly cookie
    const response = NextResponse.json({ success: true, message: "Login successful" });

    response.cookies.set("session-token", token, {
      httpOnly: true, // The cookie is not accessible via client-side JavaScript
      secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
      maxAge: 60 * 60 * 2, // 2 hours in seconds
      path: "/", // The cookie is available for all paths
    });

    return response;

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}