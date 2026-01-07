import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { recipients } from "../../../lib/schema";

export async function GET() {
  try {
    const allRecipients = await db.select().from(recipients);
    return NextResponse.json(allRecipients);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
