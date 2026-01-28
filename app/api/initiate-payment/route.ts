import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../../lib/db";
import { transactions, recipients } from "../../../lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { to, amount, senderDetails, agentId, exchangeRate } = await req.json();
  const uuid = crypto.randomUUID().replace(/-/g, "");

  // Generate transaction hash
  const hashData = `${uuid}-${to}-${amount}-${JSON.stringify(senderDetails)}-${agentId}-${Date.now()}`;
  const hash = crypto.createHash("sha256").update(hashData).digest("hex");

  // Find recipient
  const recipient = await db.select().from(recipients).where(eq(recipients.wallet, to)).limit(1);
  if (!recipient.length) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 400 });
  }

  // Calculate commission amounts
  const totalUSD = amount * exchangeRate;
  const brokerCommissionRate = 0.15;
  const agentCommissionRate = 0.05;
  const brokerCommissionUSD = totalUSD * brokerCommissionRate;
  const agentCommissionUSD = totalUSD * agentCommissionRate;
  const commissionUSD = brokerCommissionUSD; // Solo broker commission se descuenta
  const netAmountUSD = totalUSD - commissionUSD;
  const netAmountWLD = netAmountUSD / exchangeRate;

  // Store transaction data
  await db.insert(transactions).values({
    id: uuid,
    hash,
    recipientId: recipient[0].id,
    agentId: agentId ? parseInt(agentId) : null,
    senderName: senderDetails.name,
    senderWhatsapp: senderDetails.whatsapp,
    senderBankAccount: senderDetails.bankAccount,
    senderBankName: senderDetails.bankName,
    senderAccountType: senderDetails.accountType,
    amount,
    exchangeRate,
    commissionRate: brokerCommissionRate,
    commissionUSD,
    totalUSD,
    brokerCommissionRate,
    agentCommissionRate,
    brokerCommissionUSD,
    agentCommissionUSD,
    netAmountUSD,
    netAmountWLD,
    token: 'WLD',
    netAmountToken: netAmountWLD,
    status: "initiated",
    recipientCompleted: false,
    createdAt: new Date(),
  });

  // Store nonce in cookie
  cookies().set({
    name: "payment-nonce",
    value: uuid,
    httpOnly: true,
  });

  console.log(uuid, hash);

  return NextResponse.json({ id: uuid, hash });
}
