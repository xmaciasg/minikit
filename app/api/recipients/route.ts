import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const { name, wallet, phone } = await req.json();
    const newRecipient = await db.insert(recipients).values({
      name,
      wallet,
      phone,
    }).returning();
    return NextResponse.json(newRecipient[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create recipient" }, { status: 500 });
  }
}
