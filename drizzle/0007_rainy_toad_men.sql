ALTER TABLE `orders` ADD `stripeProductId` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `stripePriceId` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `downloadToken` varchar(128);--> statement-breakpoint
ALTER TABLE `orders` ADD `downloadExpiresAt` timestamp;