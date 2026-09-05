CREATE TABLE `visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_hash` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`visited_at` integer NOT NULL,
	`city` text,
	`region` text,
	`country` text,
	`device` text NOT NULL,
	`browser` text NOT NULL,
	`source` text NOT NULL,
	`path` text NOT NULL,
	`referrer` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `visits_session_hash_unique` ON `visits` (`session_hash`);--> statement-breakpoint
CREATE INDEX `idx_visits_visited_at` ON `visits` (`visited_at`);--> statement-breakpoint
CREATE INDEX `idx_visits_visitor_hash` ON `visits` (`visitor_hash`);
--> statement-breakpoint
PRAGMA optimize;
