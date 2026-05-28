-- Per-lesson interactive tasks (quiz, prompt-exercise, reflection)
-- + badges catalog + user_badges awards.

CREATE TABLE `tasks` (
  `id` text PRIMARY KEY NOT NULL,
  `lesson_id` text NOT NULL,
  `slug` text NOT NULL,
  `kind` text NOT NULL,
  `prompt_mn` text NOT NULL,
  `prompt_en` text,
  `payload_json` text NOT NULL,
  `xp_reward` integer DEFAULT 10 NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `tasks_lesson_sort_idx` ON `tasks` (`lesson_id`, `sort_order`);
CREATE UNIQUE INDEX `tasks_lesson_slug_idx` ON `tasks` (`lesson_id`, `slug`);

CREATE TABLE `badges` (
  `slug` text PRIMARY KEY NOT NULL,
  `title_mn` text NOT NULL,
  `title_en` text,
  `description_mn` text NOT NULL,
  `description_en` text,
  `icon_key` text NOT NULL,
  `criteria_kind` text NOT NULL,
  `criteria_value` integer,
  `criteria_slug` text,
  `sort_order` integer DEFAULT 0 NOT NULL
);

CREATE TABLE `user_badges` (
  `user_id` text NOT NULL,
  `badge_slug` text NOT NULL,
  `awarded_at` text NOT NULL,
  PRIMARY KEY (`user_id`, `badge_slug`),
  FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`badge_slug`) REFERENCES `badges`(`slug`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `user_badges_user_idx` ON `user_badges` (`user_id`);
