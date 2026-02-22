import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "questions.txt");
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

function getHKTime(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}/${get("month")}/${get("day")} HKT ${get("hour")}:${get("minute")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = body.question;

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Invalid question" },
        { status: 400 }
      );
    }

    const trimmed = question.trim();

    // 1) Log the question to file
    const timestamp = getHKTime();
    const logEntry = `[${timestamp}]"${trimmed}"\n--------------------------------------\n`;
    fs.appendFileSync(LOG_FILE, logEntry, "utf-8");

    // 2) Forward to FastAPI for AI answer
    const aiRes = await fetch(`${FASTAPI_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: trimmed }),
    });

    if (!aiRes.ok) {
      throw new Error(`FastAPI responded with status ${aiRes.status}`);
    }

    const aiData = await aiRes.json();

    return NextResponse.json({ success: true, answer: aiData.answer });
  } catch (error) {
    console.error("Failed to process question:", error);
    return NextResponse.json(
      {
        error: "Failed to process question",
        answer:
          "Sorry, I'm having trouble connecting right now. Please try again later.",
      },
      { status: 500 }
    );
  }
}
