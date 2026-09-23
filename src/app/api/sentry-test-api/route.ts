import { NextResponse } from "next/server";

export async function GET() {
  throw new Error("Sentry Test Error (Server-Side API Route)");
  return NextResponse.json({ success: true });
}
