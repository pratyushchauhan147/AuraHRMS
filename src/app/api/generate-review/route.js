import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserSession } from "@/lib/session";

export async function POST(request) {
  // 🔹 Validate API key
  if (!process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  // 🔹 Validate session
  const user = await getUserSession();
  if (!user || (user.role !== "SENIOR_MANAGER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  // 🔹 Parse request body
  const { employeeName, bulletPoints } = await request.json();
  if (!employeeName || !bulletPoints) {
    return NextResponse.json(
      { error: "Employee name and bullet points are required." },
      { status: 400 }
    );
  }

  try {
    // 🔹 Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 🔹 Build prompt
    const prompt = `
      Act as an experienced and empathetic HR Manager.
      Write a professional, constructive, and encouraging performance review draft
      based on the following information.

      Employee Name: ${employeeName}

      Performance Bullet Points:
      ---
      ${bulletPoints}
      ---

      Begin your review directly with the employee's name.
    `;

    // 🔹 Generate response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text;

    // 🔹 Clean up potential markdown fences
    text = text
      .replace(/```/g, "")
      .replace(/^[\s\n]*|[\s\n]*$/g, "");

    return NextResponse.json({ reviewText: text });
  } catch (error) {
    console.error("Error generating performance review:", error);
    return NextResponse.json(
      { error: "Failed to generate AI review. See server logs for details." },
      { status: 500 }
    );
  }
}
