import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { transactions } from "../../../../../lib/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await db.update(transactions).set({ recipientCompleted: true }).where(eq(transactions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}