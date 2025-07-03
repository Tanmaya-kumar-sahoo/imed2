CREATE TABLE `conditions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`symptoms` text NOT NULL,
	`severity` text NOT NULL,
	`requires_doctor_visit` integer DEFAULT false NOT NULL,
	`is_emergency` integer DEFAULT false NOT NULL,
	`advice` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conditions_name_unique` ON `conditions` (`name`);--> statement-breakpoint
CREATE TABLE `medicine_conditions` (
	`medicine_id` text NOT NULL,
	`condition_id` text NOT NULL,
	PRIMARY KEY(`medicine_id`, `condition_id`),
	FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`condition_id`) REFERENCES `conditions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `medicines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`generic_name` text,
	`description` text NOT NULL,
	`requires_prescription` integer DEFAULT false NOT NULL,
	`category` text,
	`dosage` text,
	`side_effects` text,
	`warnings` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recommendation_medicines` (
	`recommendation_id` text NOT NULL,
	`medicine_id` text NOT NULL,
	PRIMARY KEY(`recommendation_id`, `medicine_id`),
	FOREIGN KEY (`recommendation_id`) REFERENCES `recommendations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`condition_id` text NOT NULL,
	`symptoms` text NOT NULL,
	`age` text,
	`gender` text,
	`severity` text,
	`additional_advice` text,
	`is_emergency` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`condition_id`) REFERENCES `conditions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_ai_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`model` text DEFAULT 'gpt-3.5-turbo',
	`temperature` text DEFAULT '0.7',
	`top_p` text DEFAULT '0.95',
	`max_tokens` integer DEFAULT 500,
	`prompt_template` text,
	`api_key` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_health_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`height` text,
	`weight` text,
	`blood_type` text,
	`allergies` text,
	`chronic_conditions` text,
	`medications` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`photo_url` text,
	`role` text DEFAULT 'user' NOT NULL,
	`preferred_language` text DEFAULT 'en',
	`age_group` text,
	`last_login` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);