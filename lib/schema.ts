import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const recipients = sqliteTable('recipients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  wallet: text('wallet').notNull().unique(),
  phone: text('phone').notNull(),
});

export const agents = sqliteTable('agents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipientId: integer('recipient_id').references(() => recipients.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  hash: text('hash').notNull().unique(),
  recipientId: integer('recipient_id').references(() => recipients.id),
  agentId: integer('agent_id').references(() => agents.id),
  senderName: text('sender_name').notNull(),
  senderWhatsapp: text('sender_whatsapp').notNull(),
  senderBankAccount: text('sender_bank_account').notNull(),
  senderBankName: text('sender_bank_name').notNull(),
  senderAccountType: text('sender_account_type').notNull(),
  amount: real('amount').notNull(),
  exchangeRate: real('exchange_rate').notNull(),
  commissionRate: real('commission_rate').notNull(),
  totalUSD: real('total_usd').notNull(),
  commissionUSD: real('commission_usd').notNull(),
  netAmountUSD: real('net_amount_usd').notNull(),
  netAmountWLD: real('net_amount_wld').notNull(),
  status: text('status').notNull(),
  transactionId: text('transaction_id'),
  recipientCompleted: integer('recipient_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  brokerCommissionRate: real('broker_commission_rate').notNull(),
  agentCommissionRate: real('agent_commission_rate').notNull(),
  brokerCommissionUSD: real('broker_commission_usd').notNull(),
  agentCommissionUSD: real('agent_commission_usd').notNull(),
  token: text('token').notNull().default('WLD'),
  netAmountToken: real('net_amount_token').notNull(),
});

export const recipientsRelations = relations(recipients, ({ many }) => ({
  transactions: many(transactions),
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one }) => ({
  recipient: one(recipients, {
    fields: [agents.recipientId],
    references: [recipients.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  recipient: one(recipients, {
    fields: [transactions.recipientId],
    references: [recipients.id],
  }),
}));