CREATE TABLE `subscription_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`tier` enum('explorer','seeker','oracle') NOT NULL,
	`billingInterval` enum('monthly','annual') NOT NULL,
	`price_usd` decimal(8,2) NOT NULL,
	`retail_price_usd` decimal(8,2),
	`paypal_plan_id` varchar(64),
	`is_founding_rate` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`features` json NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`)
);
