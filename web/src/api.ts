export type CourseCatalogItem = {
  id: string;
  slug: string;
  titleMn: string;
  titleEn: string | null;
  summaryMn: string | null;
  summaryEn: string | null;
  product: string;
  category: string;
  lecturesCount: number | null;
  videoLength: string | null;
  quizzesCount: number | null;
  externalUrl: string | null;
  sortOrder: number;
};

export type LessonListItem = {
  id: string;
  slug: string;
  titleMn: string;
  titleEn: string | null;
  durationMin: number | null;
  sortOrder: number;
};

const base =
  typeof import.meta.env.VITE_API_BASE === "string"
    ? import.meta.env.VITE_API_BASE.replace(/\/$/, "")
    : "";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function getCourses(filters?: {
  q?: string;
  products?: string[];
  categories?: string[];
}): Promise<{ courses: CourseCatalogItem[] }> {
  const sp = new URLSearchParams();
  if (filters?.q?.trim()) {
    sp.set("q", filters.q.trim());
  }
  for (const p of filters?.products ?? []) {
    if (p) {
      sp.append("product", p);
    }
  }
  for (const c of filters?.categories ?? []) {
    if (c) {
      sp.append("category", c);
    }
  }
  const qs = sp.toString();
  return fetchJson(`/api/courses${qs ? `?${qs}` : ""}`);
}

/** Primary catalog title — Mongolian-first; falls back to English. */
export function courseDisplayTitle(c: Pick<CourseCatalogItem, "titleEn" | "titleMn">): string {
  return c.titleMn?.trim() || c.titleEn || "";
}

export function getCourse(slug: string): Promise<{
  course: CourseCatalogItem & { createdAt?: string };
  lessons: LessonListItem[];
}> {
  return fetchJson(`/api/courses/${encodeURIComponent(slug)}`);
}

export type TaskKind =
  | "quiz_single"
  | "quiz_multi"
  | "prompt_exercise"
  | "reflection";

export type TaskOption = { id: string; mn: string; en?: string };

export type TaskPayload = {
  options?: TaskOption[];
  minChars?: number;
  rubricMn?: string;
};

export type LessonTask = {
  id: string;
  slug: string;
  kind: TaskKind;
  promptMn: string;
  promptEn: string | null;
  xpReward: number;
  sortOrder: number;
  payload: TaskPayload;
};

export function getLesson(
  courseSlug: string,
  lessonSlug: string,
): Promise<{
  course: CourseCatalogItem;
  lesson: LessonListItem & { contentMd: string | null };
  tasks: LessonTask[];
}> {
  return fetchJson(
    `/api/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}`,
  );
}
