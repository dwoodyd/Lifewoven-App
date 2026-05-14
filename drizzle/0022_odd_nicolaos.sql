ALTER TABLE `users` MODIFY COLUMN `storeAccess` enum('standalone','discount','library','library_during_beta') NOT NULL DEFAULT 'standalone';--> statement-breakpoint
ALTER TABLE `users` ADD `billingStatus` enum('trialing_no_card','explorer_tier_founding_rate_waiting','active','cancelled') DEFAULT 'trialing_no_card';--> statement-breakpoint
ALTER TABLE `users` ADD `betaStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `betaEndDate` timestamp;