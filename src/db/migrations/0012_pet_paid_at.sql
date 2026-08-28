ALTER TABLE `pet` ADD `paid_at` integer;--> statement-breakpoint
UPDATE `pet` SET `paid_at` = `updated_at` WHERE `status` = 'paid' AND `paid_at` IS NULL;
