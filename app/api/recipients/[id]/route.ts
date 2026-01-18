import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { recipients } from "../../../../lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipient = await db.select().from(recipients).where(eq(recipients.id, parseInt(params.id))).limit(1);
    if (!recipient.length) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }
    return NextResponse.json(recipient[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, wallet, phone } = await req.json();
    const updated = await db.update(recipients).set({
      name,
      wallet,
      phone,
    }).where(eq(recipients.id, parseInt(params.id))).returning();
    if (!updated.length) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update recipient" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await db.delete(recipients).where(eq(recipients.id, parseInt(params.id))).returning();
    if (!deleted.length) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Recipient deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete recipient" }, { status: 500 });
  }
}