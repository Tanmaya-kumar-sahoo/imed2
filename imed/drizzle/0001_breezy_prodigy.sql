CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`age` integer,
	`phone` text,
	`email` text,
	`address` text,
	`blood_type` text,
	`allergies` text,
	`chronic_conditions` text,
	`medications` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patient_presets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`gender` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_health_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`height` text,
	`weight` text,
	`blood_type` text,
	`allergies` text,
	`chronic_conditions` text,
	`medications` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_health_profiles`("id", "user_id", "height", "weight", "blood_type", "allergies", "chronic_conditions", "medications", "created_at", "updated_at") SELECT "id", "user_id", "height", "weight", "blood_type", "allergies", "chronic_conditions", "medications", "created_at", "updated_at" FROM `user_health_profiles`;--> statement-breakpoint
DROP TABLE `user_health_profiles`;--> statement-breakpoint
ALTER TABLE `__new_user_health_profiles` RENAME TO `user_health_profiles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `users` ADD `password` text;