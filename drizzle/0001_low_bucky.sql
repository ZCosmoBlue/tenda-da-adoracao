CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `photos` ADD `sort_order` integer DEFAULT 0 NOT NULL;