import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { transactions, agents, recipients } from "../../../lib/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let whereClause = undefined;

  if (agentId) {
    whereClause = eq(transactions.agentId, parseInt(agentId));
  }

  if (startDate && endDate) {
    const dateClause = and(
      gte(transactions.createdAt, new Date(startDate)),
      lte(transactions.createdAt, new Date(endDate))
    );
    whereClause = whereClause ? and(whereClause, dateClause) : dateClause;
  } else if (startDate) {
    const dateClause = gte(transactions.createdAt, new Date(startDate));
    whereClause = whereClause ? and(whereClause, dateClause) : dateClause;
  } else if (endDate) {
    const dateClause = lte(transactions.createdAt, new Date(endDate));
    whereClause = whereClause ? and(whereClause, dateClause) : dateClause;
  }

  const query = db
    .select({
      id: transactions.id,
      hash: transactions.hash,
      amount: transactions.amount,
      exchangeRate: transactions.exchangeRate,
      totalUSD: transactions.totalUSD,
      brokerCommissionUSD: transactions.brokerCommissionUSD,
      agentCommissionUSD: transactions.agentCommissionUSD,
      commissionUSD: transactions.commissionUSD,
      netAmountUSD: transactions.netAmountUSD,
      netAmountWLD: transactions.netAmountWLD,
      status: transactions.status,
      createdAt: transactions.createdAt,
      agentId: transactions.agentId,
      agentName: agents.name,
      recipientId: transactions.recipientId,
      recipientName: recipients.name,
    })
    .from(transactions)
    .leftJoin(agents, eq(transactions.agentId, agents.id))
    .leftJoin(recipients, eq(transactions.recipientId, recipients.id))
    .orderBy(desc(transactions.createdAt));

  const transactionList = whereClause 
    ? await query.where(whereClause)
    : await query;

  return NextResponse.json(transactionList);
}