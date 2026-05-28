import type { AcademyUserPayload } from "./api";

const base =
  typeof import.meta.env.VITE_API_BASE === "string"
    ? import.meta.env.VITE_API_BASE.replace(/\/$/, "")
    : "";

export type AwardedBadge = {
  slug: string;
  titleMn: string;
  descriptionMn: string;
  iconKey: string;
};

export type TaskAnswer =
  | { id: string }
  | { ids: string[] }
  | { text: string };

export type SubmitResult = {
  correct: boolean;
  explanationMn?: string;
  xpAwarded: number;
  newBadges: AwardedBadge[];
  payload: AcademyUserPayload;
};

export async function submitTask(
  userId: string,
  taskId: string,
  courseId: string,
  answer: TaskAnswer,
): Promise<SubmitResult> {
  const res = await fetch(
    `${base}/api/academy/users/${encodeURIComponent(userId)}/tasks/${encodeURIComponent(taskId)}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, answer }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`);
  }
  return res.json() as Promise<SubmitResult>;
}

export type BadgeListEntry = {
  slug: string;
  titleMn: string;
  descriptionMn: string;
  iconKey: string;
  awardedAt?: string;
  progress?: { current: number; target: number } | null;
};

export async function fetchBadges(userId: string): Promise<{
  earned: BadgeListEntry[];
  locked: BadgeListEntry[];
}> {
  const res = await fetch(
    `${base}/api/academy/users/${encodeURIComponent(userId)}/badges`,
  );
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<{
    earned: BadgeListEntry[];
    locked: BadgeListEntry[];
  }>;
}
