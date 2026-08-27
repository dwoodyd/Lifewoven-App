DROP INDEX `idx_beta_access_userId` ON `beta_access`;--> statement-breakpoint
ALTER TABLE `beta_access` ADD CONSTRAINT `uq_beta_access_userId` UNIQUE(`userId`);