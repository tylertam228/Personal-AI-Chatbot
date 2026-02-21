import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── API Route Handler ─────────────────────────────────────────────
// This file creates a POST endpoint at /api/log-question
// Next.js App Router uses the file path to determine the URL:
//   src/app/api/log-question/route.ts  →  POST /api/log-question

// The log file will be saved in the project root (or wherever the
// server runs from). On your Ubuntu server, this will be in the
// same directory as your Next.js app.
const LOG_FILE = path.join(process.cwd(), "questions.txt");

// Format the current time in Hong Kong timezone
function getHKTime(): string {
  const now = new Date();
  // Intl.DateTimeFormat formats the date according to locale and timezone.
  // "en-GB" gives us DD/MM/YYYY format; we'll reformat it to YYYY/MM/DD.
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
  // parts is an array like: [{type:'day',value:'22'}, {type:'month',value:'02'}, ...]
  // We extract each part by its type.
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");

  return `${year}/${month}/${day} HKT ${hour}:${minute}`;
}

// POST handler — receives { question: string } in the request body
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body. TypeScript infers `body` as `any` here;
    // we trust the client sends { question: string }.
    const body = await request.json();
    const question = body.question;

    // Validate: make sure question is a non-empty string
    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Invalid question" },
        { status: 400 }
      );
    }

    // Format the log entry
    const timestamp = getHKTime();
    const logEntry = `[${timestamp}]"${question.trim()}"\n--------------------------------------\n`;

    // Append to the log file. fs.appendFileSync creates the file if
    // it doesn't exist, or appends to it if it does.
    fs.appendFileSync(LOG_FILE, logEntry, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log question:", error);
    return NextResponse.json(
      { error: "Failed to log question" },
      { status: 500 }
    );
  }
}
