import { and, asc, eq, inArray, like, or } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db";
import { courses, lessons } from "./db/schema";

export type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  "*",
  cors({
    origin: (origin) =>
      origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/courses", async (c) => {
  const db = createDb(c.env.DB);
  const qRaw = c.req.query("q")?.trim();
  const products = [
    ...new Set(
      c.req
        .queries("product")
        .flatMap((p) => p.split(","))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  const categories = [
    ...new Set(
      c.req
        .queries("category")
        .flatMap((p) => p.split(","))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];

  const conditions = [];

  if (qRaw) {
    const pat = `%${qRaw}%`;
    conditions.push(
      or(like(courses.titleMn, pat), like(courses.titleEn, pat)),
    );
  }

  if (products.length) {
    conditions.push(inArray(courses.product, products));
  }

  if (categories.length) {
    conditions.push(inArray(courses.category, categories));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const qb = db
    .select({
      id: courses.id,
      slug: courses.slug,
      titleMn: courses.titleMn,
      titleEn: courses.titleEn,
      summaryMn: courses.summaryMn,
      summaryEn: courses.summaryEn,
      product: courses.product,
      category: courses.category,
      lecturesCount: courses.lecturesCount,
      videoLength: courses.videoLength,
      quizzesCount: courses.quizzesCount,
      externalUrl: courses.externalUrl,
      sortOrder: courses.sortOrder,
    })
    .from(courses)
    .$dynamic();

  const rows = whereClause
    ? await qb
        .where(whereClause)
        .orderBy(asc(courses.sortOrder), asc(courses.titleEn))
    : await qb.orderBy(asc(courses.sortOrder), asc(courses.titleEn));

  return c.json({ courses: rows });
});

app.get("/api/courses/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = createDb(c.env.DB);

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!course) {
    return c.json({ error: "not_found" }, 404);
  }

  const lessonRows = await db
    .select({
      id: lessons.id,
      slug: lessons.slug,
      titleMn: lessons.titleMn,
      titleEn: lessons.titleEn,
      durationMin: lessons.durationMin,
      sortOrder: lessons.sortOrder,
    })
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(asc(lessons.sortOrder), asc(lessons.titleMn));

  return c.json({ course, lessons: lessonRows });
});

app.get("/api/courses/:courseSlug/lessons/:lessonSlug", async (c) => {
  const courseSlug = c.req.param("courseSlug");
  const lessonSlug = c.req.param("lessonSlug");
  const db = createDb(c.env.DB);

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, courseSlug))
    .limit(1);

  if (!course) {
    return c.json({ error: "course_not_found" }, 404);
  }

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(
      and(eq(lessons.courseId, course.id), eq(lessons.slug, lessonSlug)),
    )
    .limit(1);

  if (!lesson) {
    return c.json({ error: "lesson_not_found" }, 404);
  }

  return c.json({ course, lesson });
});

export default app;
