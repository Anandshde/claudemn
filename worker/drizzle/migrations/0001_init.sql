-- Courses & lessons foundation (D1 / SQLite)

CREATE TABLE `courses` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `title_mn` text NOT NULL,
  `title_en` text,
  `summary_mn` text,
  `summary_en` text,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL
);

CREATE UNIQUE INDEX `courses_slug_unique` ON `courses` (`slug`);

CREATE TABLE `lessons` (
  `id` text PRIMARY KEY NOT NULL,
  `course_id` text NOT NULL,
  `slug` text NOT NULL,
  `title_mn` text NOT NULL,
  `title_en` text,
  `content_md` text,
  `duration_min` integer,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `lessons_course_slug_unique` ON `lessons` (`course_id`, `slug`);
