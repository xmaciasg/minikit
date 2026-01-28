-- Agregar campos faltantes a la tabla transactions
ALTER TABLE transactions ADD COLUMN exchange_rate REAL NOT NULL DEFAULT 0;
ALTER TABLE transactions ADD COLUMN broker_commission_rate REAL NOT NULL DEFAULT 0.15;
ALTER TABLE transactions ADD COLUMN agent_commission_rate REAL NOT NULL DEFAULT 0.05;
ALTER TABLE transactions ADD COLUMN broker_commission_usd REAL NOT NULL DEFAULT 0;
ALTER TABLE transactions ADD COLUMN agent_commission_usd REAL NOT NULL DEFAULT 0;
ALTER TABLE transactions ADD COLUMN total_usd REAL NOT NULL DEFAULT 0;
ALTER TABLE transactions ADD COLUMN net_amount_usd REAL NOT NULL DEFAULT 0;
ALTER TABLE transactions ADD COLUMN net_amount_wld REAL NOT NULL DEFAULT 0;

-- Agregar foreign key faltante para agent_id
CREATE TABLE transactions_new (
	`id` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`recipient_id` integer,
	`agent_id` integer,
	`sender_name` text NOT NULL,
	`sender_whatsapp` text NOT NULL,
	`sender_bank_account` text NOT NULL,
	`sender_bank_name` text NOT NULL,
	`sender_account_type` text NOT NULL,
	`amount` real NOT NULL,
	`exchange_rate` real NOT NULL,
	`broker_commission_rate` real NOT NULL,
	`agent_commission_rate` real NOT NULL,
	`broker_commission_usd` real NOT NULL,
	`agent_commission_usd` real NOT NULL,
	`total_usd` real NOT NULL,
	`net_amount_usd` real NOT NULL,
	`net_amount_wld` real NOT NULL,
	`status` text NOT NULL,
	`transaction_id` text,
	`recipient_completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`recipient_id`) REFERENCES `recipients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);

INSERT INTO transactions_new SELECT * FROM transactions;
DROP TABLE transactions;
ALTER TABLE transactions_new RENAME TO transactions;
CREATE UNIQUE INDEX `transactions_hash_unique` ON `transactions` (`hash`);
