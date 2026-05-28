import { relations, sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  /** Display title — primary label on catalog cards */
  titleMn: text("title_mn").notNull(),
  titleEn: text("title_en"),
  summaryMn: text("summary_mn"),
  summaryEn: text("summary_en"),
  /** Mirrors claude.com/resources/courses filters */
  product: text("product").notNull().default(""),
  category: text("category").notNull().default(""),
  lecturesCount: integer("lectures_count"),
  videoLength: text("video_length"),
  quizzesCount: integer("quizzes_count"),
  /** Original course landing page */
  externalUrl: text("external_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const lessons = sqliteTable("lessons", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  titleMn: text("title_mn").notNull(),
  titleEn: text("title_en"),
  contentMd: text("content_md"),
  durationMin: integer("duration_min"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  tasks: many(tasks),
}));

/** Per-lesson interactive task. kind drives validator + payloadJson shape. */
export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  /** quiz_single | quiz_multi | prompt_exercise | reflection */
  kind: text("kind").notNull(),
  promptMn: text("prompt_mn").notNull(),
  promptEn: text("prompt_en"),
  /** JSON-encoded; shape depends on `kind`. Server strips correct answers before sending. */
  payloadJson: text("payload_json").notNull(),
  xpReward: integer("xp_reward").notNull().default(10),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  lesson: one(lessons, {
    fields: [tasks.lessonId],
    references: [lessons.id],
  }),
}));

/** Gamified academy: each learner owns a profile keyed by a generated id (no auth). */
export const academyUsers = sqliteTable("academy_users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  joinedDate: text("joined_date").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

/** One row per completed lesson or task. itemKey is "lesson:<id>" or "task:<id>". */
export const academyProgress = sqliteTable(
  "academy_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    courseId: text("course_id").notNull(),
    itemKey: text("item_key").notNull(),
    completedAt: text("completed_at").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.courseId, t.itemKey] }),
  }),
);

/** Mirror of the in-memory stats blob in the React design. */
export const academyStats = sqliteTable("academy_stats", {
  userId: text("user_id")
    .primaryKey()
    .references(() => academyUsers.id, { onDelete: "cascade" }),
  totalXp: integer("total_xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
});

/** XP earned per (user, date) — powers weekly bars, 30-day heatmap, cumulative line. */
export const academyDailyXp = sqliteTable(
  "academy_daily_xp",
  {
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    xp: integer("xp").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.date] }),
  }),
);

/** Catalog of awardable badges. Seeded; immutable from app. */
export const badges = sqliteTable("badges", {
  slug: text("slug").primaryKey(),
  titleMn: text("title_mn").notNull(),
  titleEn: text("title_en"),
  descriptionMn: text("description_mn").notNull(),
  descriptionEn: text("description_en"),
  iconKey: text("icon_key").notNull(),
  /** first_lesson | first_course | streak_n | xp_n | course_complete */
  criteriaKind: text("criteria_kind").notNull(),
  criteriaValue: integer("criteria_value"),
  /** For course_complete: the course slug that triggers it. */
  criteriaSlug: text("criteria_slug"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Awards granted to a user. */
export const userBadges = sqliteTable(
  "user_badges",
  {
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    badgeSlug: text("badge_slug")
      .notNull()
      .references(() => badges.slug, { onDelete: "cascade" }),
    awardedAt: text("awarded_at").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.badgeSlug] }),
  }),
);
