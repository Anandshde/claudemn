/** Admin API client. All calls authenticate via Authorization: Bearer <token>. */
import { ADMIN_UNAUTHED_EVENT, clearToken, getToken } from "./auth";

const base =
  typeof import.meta.env.VITE_API_BASE === "string"
    ? import.meta.env.VITE_API_BASE.replace(/\/$/, "")
    : "";

async function adminFetch<T>(
  path: string,
  init?: RequestInit & { tokenOverride?: string },
): Promise<T> {
  const tok = init?.tokenOverride ?? getToken();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event(ADMIN_UNAUTHED_EVENT));
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export type AdminCourseOverview = {
  id: string;
  slug: string;
  titleMn: string;
  titleEn: string | null;
  product: string;
  category: string;
  sortOrder: number;
  lessonCount: number;
};

export type AdminLesson = {
  id: string;
  courseId: string;
  slug: string;
  titleMn: string;
  titleEn: string | null;
  contentMd: string | null;
  durationMin: number | null;
  sortOrder: number;
  createdAt: string;
};

export type AdminTaskOption = { id: string; mn: string; en?: string };

export type AdminTaskPayload = {
  options?: AdminTaskOption[];
  correctId?: string;
  correctIds?: string[];
  minChars?: number;
  mustIncludeAny?: string[];
  mustIncludeAll?: string[];
  rubricMn?: string;
  explanationMn?: string;
};

export type AdminTaskKind =
  | "quiz_single"
  | "quiz_multi"
  | "prompt_exercise"
  | "reflection";

export type AdminTask = {
  id: string;
  slug: string;
  kind: AdminTaskKind;
  promptMn: string;
  promptEn: string | null;
  xpReward: number;
  sortOrder: number;
  payload: AdminTaskPayload;
};

export type AdminLessonWithTasks = AdminLesson & { tasks: AdminTask[] };

export type AdminCourseDetail = {
  course: {
    id: string;
    slug: string;
    titleMn: string;
    titleEn: string | null;
    summaryMn: string | null;
    summaryEn: string | null;
    product: string;
    category: string;
  };
  lessons: AdminLessonWithTasks[];
};

export function checkToken(tokenOverride?: string): Promise<{ ok: true }> {
  return adminFetch("/api/admin/auth/check", {
    method: "POST",
    body: JSON.stringify({}),
    tokenOverride,
  });
}

export function listCourses(): Promise<{ courses: AdminCourseOverview[] }> {
  return adminFetch("/api/admin/courses-overview");
}

export function getCourse(slug: string): Promise<AdminCourseDetail> {
  return adminFetch(`/api/admin/courses/${encodeURIComponent(slug)}`);
}

export function createLesson(
  courseSlug: string,
  body: Partial<AdminLesson>,
): Promise<{ lesson: AdminLesson }> {
  return adminFetch(`/api/admin/courses/${encodeURIComponent(courseSlug)}/lessons`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateLesson(
  id: string,
  body: Partial<AdminLesson>,
): Promise<{ lesson: AdminLesson }> {
  return adminFetch(`/api/admin/lessons/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteLesson(id: string): Promise<{ ok: true }> {
  return adminFetch(`/api/admin/lessons/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function createTask(
  lessonId: string,
  body: {
    slug: string;
    kind: AdminTaskKind;
    promptMn: string;
    promptEn?: string | null;
    payload: AdminTaskPayload;
    xpReward?: number;
    sortOrder?: number;
  },
): Promise<{ task: AdminTask }> {
  return adminFetch(`/api/admin/lessons/${encodeURIComponent(lessonId)}/tasks`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateTask(
  id: string,
  body: Partial<{
    slug: string;
    kind: AdminTaskKind;
    promptMn: string;
    promptEn: string | null;
    payload: AdminTaskPayload;
    xpReward: number;
    sortOrder: number;
  }>,
): Promise<{ task: AdminTask }> {
  return adminFetch(`/api/admin/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteTask(id: string): Promise<{ ok: true }> {
  return adminFetch(`/api/admin/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
