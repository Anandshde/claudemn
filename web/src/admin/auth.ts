/** Admin auth — single bearer token persisted in localStorage. */
import { ref, computed } from "vue";

const TOKEN_KEY = "mn-admin-token";

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

const token = ref<string | null>(readToken());

export const isAuthed = computed(() => !!token.value);

export function getToken(): string | null {
  return token.value;
}

export function setToken(value: string): void {
  token.value = value;
  try {
    localStorage.setItem(TOKEN_KEY, value);
  } catch {
    /* private mode — keep in-memory only */
  }
}

export function clearToken(): void {
  token.value = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Dispatched globally when the API returns 401 — router listens to redirect. */
export const ADMIN_UNAUTHED_EVENT = "admin-unauthed";
