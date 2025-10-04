// src/app/api/copilot/route.js
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getEmployeeDetailsByName, updateEmployeeNotes } from "@/lib/copilot-tools";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper function to extract name from prompt via regex
function extractEmployeeName(prompt) {
  const nameRegex = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g;
  const matches = prompt.match(nameRegex);
  if (matches) {
    for (const name of matches) {
      if (!["My", "The", "What", "Who", "Tell", "Is"].includes(name)) return name;
    }
  }
  return null;
}

// Function to call Gemini to get user intent (READ_INFO, UPDATE_NOTES, or UNKNOWN)
async function getIntention(prompt, employeeName) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const intentPrompt = `
You are an HR system that needs to understand a user's request about an employee named "${employeeName}".

Analyze the user's prompt and respond with ONLY a JSON object with two keys: "intent" and "content".

- The "intent" must be one of these strings: "READ_INFO", "UPDATE_NOTES", or "UNKNOWN".
- The "content" should be the note text user wants to add if intent is "UPDATE_NOTES". Otherwise, empty string.

Examples:
- User: "What is he working on?" -> {"intent": "READ_INFO", "content": ""}
- User: "Add a note that he completed AWS certification" -> {"intent": "UPDATE_NOTES", "content": "Completed AWS certification."}
- User: "Tell me his position" -> {"intent": "READ_INFO", "content": ""}
- User: "Record that his performance was excellent" -> {"intent": "UPDATE_NOTES", "content": "His performance was excellent."}

User prompt: "${prompt}"
`;

  try {
    const result = await model.generateContent({
      contents: [intentPrompt],
    });
    const candidate = result?.candidates?.[0];
    let text = candidate?.content?.parts?.[0]?.text ?? candidate?.content?.text ?? "";

   if (text.includes("```json")) {
  text = text.split("``````")[0].trim();
}

    return JSON.parse(text);
  } catch (error) {
    console.error("getIntention error:", error);
    return { intent: "UNKNOWN", content: "" };
  }
}

export async function POST(request) {
  const { prompt, session = {} } = await request.json();

  let selectedEmployee = session.selectedEmployee || null;

  if (!selectedEmployee) {
    const extractedName = extractEmployeeName(prompt);

    if (extractedName) {
      const employeeData = await getEmployeeDetailsByName({ name: extractedName });

      if (employeeData.error) {
        return NextResponse.json({
          response: `I couldn't find an employee named "${extractedName}". Could you please check the name and try again?`,
          session,
        });
      }

      return NextResponse.json({
        response: `Did you mean ${employeeData.name}? Please reply "Yes" to confirm.`,
        session: { ...session, selectedEmployee: employeeData.name },
      });
    } else {
      return NextResponse.json({
        response: "Please provide the full name of the employee you want information about.",
        session,
      });
    }
  }

  if (prompt.trim().toLowerCase() === "yes") {
    return NextResponse.json({
      response: `Great! You selected ${selectedEmployee}. What would you like to know or do regarding this employee?`,
      session,
    });
  }

  const { intent, content } = await getIntention(prompt, selectedEmployee);

  if (intent === "UPDATE_NOTES") {
    const updateResult = await updateEmployeeNotes({
      employeeName: selectedEmployee,
      notes: content,
    });
    if (updateResult.error) {
      return NextResponse.json({
        response: `Sorry, I was unable to update the notes. ${updateResult.error}`,
        session,
      });
    }
    return NextResponse.json({
      response: `Okay, I have updated the notes for ${selectedEmployee}.`,
      session,
    });
  }

  if (intent === "READ_INFO") {
    const employeeInfo = await getEmployeeDetailsByName({ name: selectedEmployee });
    if (employeeInfo.error) {
      return NextResponse.json({
        response: `Sorry, I couldn't find details for ${selectedEmployee}.`,
        session: { ...session, selectedEmployee: null },
      });
    }
    const reply = `Here is what I found for ${employeeInfo.name}: Position: "${employeeInfo.position}". Notes: "${employeeInfo.notes}"`;
    return NextResponse.json({
      response: reply,
      session,
    });
  }

  return NextResponse.json({
    response:
      "I'm not sure how to help with that. You can ask me to read an employee's details or update their notes.",
    session,
  });
}
