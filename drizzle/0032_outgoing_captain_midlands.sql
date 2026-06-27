ALTER TABLE `users` ADD `readingChapter` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `readingBridgeDismissed` boolean DEFAULT false NOT NULL;