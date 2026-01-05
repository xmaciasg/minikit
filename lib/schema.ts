import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const recipients = sqliteTable('recipients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  wallet: text('wallet').notNull().unique(),
  phone: text('phone').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  hash: text('hash').notNull().unique(),
  recipientId: integer('recipient_id').references(() => recipients.id),
  senderName: text('sender_name').notNull(),
  senderWhatsapp: text('sender_whatsapp').notNull(),
  senderBankAccount: text('sender_bank_account').notNull(),
  senderBankName: text('sender_bank_name').notNull(),
  senderAccountType: text('sender_account_type').notNull(),
  amount: real('amount').notNull(),
  status: text('status').notNull(),
  transactionId: text('transaction_id'),
  recipientCompleted: integer('recipient_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const recipientsRelations = relations(recipients, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  recipient: one(recipients, {
    fields: [transactions.recipientId],
    references: [recipients.id],
  }),
}));