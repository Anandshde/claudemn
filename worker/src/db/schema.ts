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

export const lessonsRelations = relations(lessons, ({ one }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
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
