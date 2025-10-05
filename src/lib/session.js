// in src/lib/session.js
import { cookies } from "next/headers";
import * as jose from "jose";

export async function getUserSession() {
  const token = cookies().get("session-token")?.value;

  if (!token) {
    console.log("No session token found in cookies.");
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload; // e.g., { id: '...', email: '...', role: '...' }
  } catch (error) {
    console.error("Failed to verify session token:", error);
    return null;
  }
}