import { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { transactions } from "../../../lib/schema";
import { eq } from "drizzle-orm";

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload;
}

export async function POST(req: NextRequest) {
  const { payload } = (await req.json()) as IRequestPayload;

  const cookieStore = cookies();
  const reference = cookieStore.get("payment-nonce")?.value;

  console.log(reference);

  if (!reference) {
    return NextResponse.json({ success: false });
  }

  // Find transaction in DB
  const transaction = await db.select().from(transactions).where(eq(transactions.id, reference)).limit(1);
  if (!transaction.length) {
    return NextResponse.json({ success: false });
  }

  console.log(payload);
  // 1. Check that the transaction we received from the mini app is the same one we sent
  if (payload.reference === reference) {
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.APP_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        },
      }
    );
    const txData = await response.json();
    console.log("Transaction verification response:", txData);
    console.log("Reference comparison - payload.reference:", payload.reference, "reference from cookie:", reference);
    
    // 2. Here we optimistically confirm the transaction.
    // Otherwise, you can poll until the status == mined
    // Improved condition: accept if transaction exists and status is not failed
    if (txData.status && txData.status !== "failed") {
      // Update transaction status
      await db.update(transactions).set({
        status: "confirmed",
        transactionId: payload.transaction_id,
      }).where(eq(transactions.id, reference));
      console.log("Transaction confirmed successfully");
      return NextResponse.json({ success: true, transactionId: payload.transaction_id });
    } else {
      console.log("Transaction verification failed - status:", txData.status);
      return NextResponse.json({ success: false });
    }
  }
  return NextResponse.json({ success: false });
}
