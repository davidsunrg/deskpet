ALTER TABLE `pet` RENAME COLUMN `paid_at` TO `delivery_at`;--> statement-breakpoint
UPDATE `pet` SET `delivery_at` = `delivery_at` + 86400000 WHERE `delivery_at` IS NOT NULL;
