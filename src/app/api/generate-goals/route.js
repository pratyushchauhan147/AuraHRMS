// src/app/api/generate-goals/route.js
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserSession } from "@/lib/session";

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not set");
    return NextResponse.json({ error: "Server config error." }, { status: 500 });
  }

  const user = await getUserSession();
  if (!user || !["SENIOR_MANAGER", "ADMIN", "HR_RECRUITER"].includes(user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { employeeName, department, role, years, strengths, tasks } = await request.json();
  if (!employeeName || !role || !tasks || tasks.length === 0) {
    return NextResponse.json({ error: "Employee info and tasks are required." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      Act as an experienced HR Manager and OKR specialist.
      Generate professional, measurable, and achievable OKRs (Objectives and Key Results)
      for an employee based on the following information:

      Employee Name: ${employeeName}
      Department: ${department}
      Role: ${role}
      Years with Company: ${years || 0}
      Strengths: ${strengths || "Not provided"}
      Tasks to Complete:
      --- 
      ${tasks.map(t => `- ${t}`).join("\n")}
      ---

      Respond with ONLY a JSON object (no markdown, no explanation) with keys:
      - "objective" (string)
      - "keyResults" (array of 3-5 strings)
      - "suggestedQuarter" (string, e.g., Q4 2025)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // --- Robust cleanup for AI output ---
    let rawText = response.text || "";
    rawText = rawText.replace(/```(?:json)?/gi, "").trim(); // remove ``` or ```json
    rawText = rawText.replace(/^json\s*/i, "").trim(); // remove any leftover 'json' at start

    let parsedJson;
    try {
      parsedJson = JSON.parse(rawText);

      // Fallback if AI returned invalid keyResults
      if (!parsedJson.keyResults || !Array.isArray(parsedJson.keyResults)) {
        console.warn("keyResults invalid, falling back to tasks:", parsedJson.keyResults);
        parsedJson.keyResults = tasks;
      }

      if (!parsedJson.objective) parsedJson.objective = "Complete assigned tasks efficiently";
      if (!parsedJson.suggestedQuarter) parsedJson.suggestedQuarter = "Q4 2025";

    } catch (err) {
      console.error("Failed to parse AI response as JSON:", err.message);
      parsedJson = {
        objective: "Complete assigned tasks efficiently",
        keyResults: tasks,
        suggestedQuarter: "Q4 2025",
        _debug: {
          aiRaw: response.text,
          parseError: err.message,
        },
      };
    }

    console.log("Final AI Parsed Output:", parsedJson);

    return NextResponse.json(parsedJson);

  } catch (err) {
    console.error("AI OKR generation error:", err);
    return NextResponse.json({ error: "AI generation failed." }, { status: 500 });
  }
}
