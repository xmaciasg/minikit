CREATE TABLE `recipients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`wallet` text NOT NULL,
	`phone` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipients_wallet_unique` ON `recipients` (`wallet`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`recipient_id` integer,
	`sender_name` text NOT NULL,
	`sender_whatsapp` text NOT NULL,
	`sender_bank_account` text NOT NULL,
	`sender_bank_name` text NOT NULL,
	`sender_account_type` text NOT NULL,
	`amount` real NOT NULL,
	`status` text NOT NULL,
	`transaction_id` text,
	`recipient_completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`recipient_id`) REFERENCES `recipients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_hash_unique` ON `transactions` (`hash`);