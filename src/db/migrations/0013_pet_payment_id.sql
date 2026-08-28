ALTER TABLE `pet` ADD `payment_id` text REFERENCES `payment`(`id`);--> statement-breakpoint
CREATE INDEX `pet_payment_id_idx` ON `pet` (`payment_id`);
