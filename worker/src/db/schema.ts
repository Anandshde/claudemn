import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
