import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { transactions, recipients } from "../../../../lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { wallet: string } }
) {
  const { wallet } = params;

  try {
    // Find recipient
    const recipient = await db.select().from(recipients).where(eq(recipients.wallet, wallet)).limit(1);
    if (!recipient.length) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    // Get transactions
    const txs = await db.select().from(transactions).where(eq(transactions.recipientId, recipient[0].id));

    return NextResponse.json(txs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}