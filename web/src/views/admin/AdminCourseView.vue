<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  getCourse,
  createLesson,
  deleteLesson,
  updateLesson,
  type AdminCourseDetail,
  type AdminLessonWithTasks,
} from "@/admin/api";
import { suggestSlug } from "@/admin/slug";
import ConfirmDelete from "@/components/admin/ConfirmDelete.vue";

const route = useRoute();
const courseSlug = computed(() => route.params.slug as string);

const data = ref<AdminCourseDetail | null>(null);
const error = ref<string | null>(null);

const showNew = ref(false);
const newTitleMn = ref("");
const newTitleEn = ref("");
const newSlug = ref("");
const newSlugTouched = ref(false);
const newDuration = ref<number | null>(null);
const busy = ref(false);

watch(newTitleMn, (v) => {
  if (!newSlugTouched.value) newSlug.value = suggestSlug(v);
});

async function load() {
  try {
    data.value = await getCourse(courseSlug.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Курс ачаалж чадсангүй";
  }
}

async function onCreate() {
  if (!newTitleMn.value.trim() || !newSlug.value.trim()) return;
  busy.value = true;
  error.value = null;
  try {
    await createLesson(courseSlug.value, {
      slug: newSlug.value.trim(),
      titleMn: newTitleMn.value.trim(),
      titleEn: newTitleEn.value.trim() || null,
      contentMd: "",
      durationMin: newDuration.value ?? undefined,
      sortOrder: (data.value?.lessons.length ?? 0) * 10 + 10,
    });
    newTitleMn.value = "";
    newTitleEn.value = "";
    newSlug.value = "";
    newSlugTouched.value = false;
    newDuration.value = null;
    showNew.value = false;
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Хадгалж чадсангүй";
  } finally {
    busy.value = false;
  }
}

async function onDelete(l: AdminLessonWithTasks) {
  try {
    await deleteLesson(l.id);
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Устгаж чадсангүй";
  }
}

async function move(l: AdminLessonWithTasks, dir: -1 | 1) {
  if (!data.value) return;
  const list = data.value.lessons;
  const i = list.findIndex((x) => x.id === l.id);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  const a = list[i].sortOrder;
  const b = list[j].sortOrder;
  try {
    await Promise.all([
      updateLesson(list[i].id, { sortOrder: b }),
      updateLesson(list[j].id, { sortOrder: a }),
    ]);
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Эрэмбэлж чадсангүй";
  }
}

onMounted(load);
watch(courseSlug, load);
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 pt-6 pb-12 sm:px-6">
    <p class="mb-4">
      <RouterLink
        to="/admin"
        class="inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
      >
        ← Бүх курсүүд
      </RouterLink>
    </p>

    <p v-if="error" class="mb-4 rounded-lg border border-accent bg-overlay px-4 py-2.5 text-sm">
      {{ error }}
    </p>

    <template v-if="data">
      <header class="mb-6">
        <p class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
          {{ data.course.product }} · {{ data.course.category }}
        </p>
        <h1 class="mt-1 font-heading text-3xl font-bold tracking-tight">
          {{ data.course.titleMn || data.course.titleEn }}
        </h1>
        <p v-if="data.course.summaryMn" class="mt-2 text-sm text-muted">
          {{ data.course.summaryMn }}
        </p>
        <p class="mt-3 text-sm">
          <RouterLink :to="`/courses/${data.course.slug}`" target="_blank" class="text-accent hover:underline">
            Нийтийн хуудсыг харах →
          </RouterLink>
        </p>
      </header>

      <section class="mb-6">
        <header class="mb-3 flex items-center justify-between">
          <h2 class="font-heading text-xl font-bold">Хичээлүүд ({{ data.lessons.length }})</h2>
          <button
            type="button"
            class="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-on-accent hover:brightness-110"
            @click="showNew = !showNew"
          >
            {{ showNew ? "Хаах" : "+ Шинэ хичээл" }}
          </button>
        </header>

        <form
          v-if="showNew"
          class="mb-4 space-y-3 rounded-2xl border border-border-token bg-surface p-5"
          @submit.prevent="onCreate"
        >
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-semibold">Гарчиг (MN)</label>
              <input
                v-model="newTitleMn"
                class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 text-sm focus:border-accent"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold">Title (EN, заавал биш)</label>
              <input
                v-model="newTitleEn"
                class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 text-sm focus:border-accent"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold">Slug</label>
              <input
                v-model="newSlug"
                @input="newSlugTouched = true"
                placeholder="lesson-slug"
                class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 font-mono text-sm focus:border-accent"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold">Үргэлжлэх (мин)</label>
              <input
                v-model.number="newDuration"
                type="number"
                min="1"
                class="w-32 rounded-lg border border-border-token bg-surface px-3 py-2 text-sm focus:border-accent"
              />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="rounded-full border border-border-token bg-panel px-4 py-1.5 text-xs"
              @click="showNew = false"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              :disabled="busy || !newTitleMn.trim() || !newSlug.trim()"
              class="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-on-accent disabled:opacity-50"
            >
              {{ busy ? "Хадгалж байна…" : "Үүсгэх" }}
            </button>
          </div>
        </form>

        <ol v-if="data.lessons.length" class="space-y-2">
          <li
            v-for="(l, i) in data.lessons"
            :key="l.id"
            class="flex items-center gap-3 rounded-xl border border-border-token bg-panel p-4 shadow-[var(--shadow-card)]"
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
              {{ i + 1 }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-heading text-base font-semibold leading-tight">
                {{ l.titleMn }}
              </p>
              <p class="mt-0.5 text-xs text-muted">
                {{ l.tasks.length }} даалгавар · {{ l.durationMin ?? "—" }} мин · slug: {{ l.slug }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-1">
              <button
                type="button"
                class="rounded-md border border-border-token bg-panel px-2 py-1 text-xs text-muted hover:border-accent"
                title="Дээш"
                @click="move(l, -1)"
              >↑</button>
              <button
                type="button"
                class="rounded-md border border-border-token bg-panel px-2 py-1 text-xs text-muted hover:border-accent"
                title="Доош"
                @click="move(l, 1)"
              >↓</button>
              <RouterLink
                :to="`/admin/courses/${data.course.slug}/lessons/${l.slug}`"
                class="rounded-md border border-border-token bg-panel px-2.5 py-1 text-xs font-medium hover:border-accent hover:text-accent"
              >
                Засах
              </RouterLink>
              <ConfirmDelete
                small
                :label="`'${l.titleMn}' устгах уу?`"
                @confirm="onDelete(l)"
              />
            </div>
          </li>
        </ol>
        <p v-else class="text-sm text-muted">Энэ курст хичээл байхгүй. Дээрх товчоор анхны хичээлийг үүсгэнэ үү.</p>
      </section>
    </template>
    <p v-else-if="!error" class="text-sm text-muted">Ачаалж байна…</p>
  </div>
</template>
