ALTER TABLE `users` MODIFY COLUMN `membershipTier` enum('explorer','seeker','oracle') NOT NULL DEFAULT 'explorer';--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);