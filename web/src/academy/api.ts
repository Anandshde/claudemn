export type AcademyProfile = {
  id: string;
  name: string;
  joinedDate: string;
};

export type AcademyServerStats = {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
};

export type AcademyUserPayload = {
  profile: AcademyProfile;
  /** progress[courseId][itemKey] = "YYYY-MM-DD" */
  progress: Record<string, Record<string, string>>;
  stats: AcademyServerStats;
  /** dailyXP["YYYY-MM-DD"] = xp earned that day */
  dailyXP: Record<string, number>;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  streak: number;
};

const base =
  typeof import.meta.env.VITE_API_BASE === "string"
    ? import.meta.env.VITE_API_BASE.replace(/\/$/, "")
    : "";

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${errBody ? ` — ${errBody}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export function createAcademyUser(name: string): Promise<AcademyUserPayload> {
  return request("/api/academy/users", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function fetchAcademyUser(id: string): Promise<AcademyUserPayload> {
  return request(`/api/academy/users/${encodeURIComponent(id)}`);
}

export type AwardedBadge = {
  slug: string;
  titleMn: string;
  descriptionMn: string;
  iconKey: string;
};

export function completeAcademyItem(
  userId: string,
  courseId: string,
  itemKey: string,
  xp: number,
): Promise<{ payload: AcademyUserPayload; newBadges: AwardedBadge[] }> {
  return request(`/api/academy/users/${encodeURIComponent(userId)}/complete`, {
    method: "POST",
    body: JSON.stringify({ courseId, itemKey, xp }),
  });
}

export function fetchLeaderboard(limit = 50): Promise<{ entries: LeaderboardEntry[] }> {
  return request(`/api/academy/leaderboard?limit=${limit}`);
}
