<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { listCourses, type AdminCourseOverview } from "@/admin/api";
import { clearToken } from "@/admin/auth";

const router = useRouter();
const items = ref<AdminCourseOverview[] | null>(null);
const error = ref<string | null>(null);

async function load() {
  try {
    const { courses } = await listCourses();
    items.value = courses;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Курсуудыг ачаалж чадсангүй.";
  }
}

function logout() {
  clearToken();
  router.push("/admin/login");
}

onMounted(load);
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 pt-6 pb-12 sm:px-6">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <p class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Админ
        </p>
        <h1 class="mt-1 font-heading text-3xl font-bold tracking-tight">Курсүүд</h1>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <RouterLink to="/" class="text-muted hover:text-accent">Нийтийн сайт →</RouterLink>
        <button
          type="button"
          class="rounded-full border border-border-token bg-panel px-3 py-1.5 text-xs font-medium hover:border-accent"
          @click="logout"
        >
          Гарах
        </button>
      </div>
    </header>

    <p v-if="error" class="mb-4 rounded-lg border border-accent bg-overlay px-4 py-2.5 text-sm">
      {{ error }}
    </p>

    <ul v-if="items" class="grid gap-3 sm:grid-cols-2">
      <li v-for="c in items" :key="c.id">
        <RouterLink
          :to="`/admin/courses/${c.slug}`"
          class="block rounded-2xl border border-border-token bg-panel p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-accent"
        >
          <p class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
            {{ c.product }} · {{ c.category }}
          </p>
          <h2 class="mt-1 font-heading text-lg font-bold leading-tight">
            {{ c.titleMn || c.titleEn }}
          </h2>
          <p class="mt-2 text-sm text-muted">
            {{ c.lessonCount }} хичээл
          </p>
        </RouterLink>
      </li>
    </ul>
    <p v-else-if="!error" class="text-sm text-muted">Ачаалж байна…</p>
  </div>
</template>
