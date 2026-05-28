<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { checkToken } from "@/admin/api";
import { setToken } from "@/admin/auth";

const route = useRoute();
const router = useRouter();

const tokenInput = ref("");
const busy = ref(false);
const error = ref<string | null>(null);

async function onSubmit() {
  const v = tokenInput.value.trim();
  if (!v) return;
  busy.value = true;
  error.value = null;
  try {
    await checkToken(v);
    setToken(v);
    const next = typeof route.query.next === "string" ? route.query.next : "/admin";
    router.push(next.startsWith("/admin") ? next : "/admin");
  } catch (e) {
    error.value =
      e instanceof Error && e.message.includes("unauthorized")
        ? "Token буруу байна."
        : e instanceof Error
          ? e.message
          : "Шалгаж чадсангүй.";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 sm:px-6">
    <RouterLink
      to="/"
      class="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
    >
      ← Нүүр
    </RouterLink>
    <div
      class="rounded-2xl border border-border-token bg-panel p-7 shadow-[var(--shadow-card)]"
    >
      <h1 class="mb-1 font-heading text-2xl font-bold text-text">Админ нэвтрэх</h1>
      <p class="mb-5 text-sm text-muted">
        Хичээл болон даалгавар нэмэх эрх. Tokenийг ашиглан нэвтэрнэ үү.
      </p>
      <form class="space-y-3" @submit.prevent="onSubmit">
        <input
          v-model="tokenInput"
          type="password"
          autocomplete="off"
          autofocus
          placeholder="Admin token"
          class="w-full rounded-xl border border-border-token bg-surface px-4 py-3 font-mono text-sm text-text outline-none focus:border-accent"
        />
        <p v-if="error" class="text-sm text-accent">{{ error }}</p>
        <button
          type="submit"
          :disabled="busy || !tokenInput.trim()"
          class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ busy ? "Шалгаж байна…" : "Нэвтрэх" }}
        </button>
      </form>
    </div>
  </div>
</template>
