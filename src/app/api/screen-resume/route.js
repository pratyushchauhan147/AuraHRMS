// src/app/api/screen-resume/route.js
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  const { resume, job_description } = await request.json();

  if (!resume || !job_description) {
    return NextResponse.json(
      { error: "Resume and job description are required." },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      Analyze the following resume and job description. 
      Respond with ONLY a JSON object (no markdown, no code fences, no explanation). 

      JSON object must have these exact keys: 
      - "match_score" (integer 0–100)
      - "summary" (two-sentence string)
      - "suggested_questions" (array of exactly three strings)

      Job Description:
      ---
      ${job_description}
      ---

      Resume:
      ---
      ${resume}
      ---
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text;

    // 🔧 Sanitize if model still returns fenced markdown
    text = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(text);
    } catch (err) {
      console.warn("⚠️ Model did not return valid JSON, fallback activated.");
      parsedJson = {
        match_score: 0,
        summary: text,
        suggested_questions: [],
      };
    }

    return NextResponse.json(parsedJson);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to get analysis from AI. See server logs for details." },
      { status: 500 }
    );
  }
}
