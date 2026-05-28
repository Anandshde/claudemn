<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  getCourse,
  updateLesson,
  createTask,
  updateTask,
  deleteTask,
  type AdminLessonWithTasks,
  type AdminTask,
} from "@/admin/api";
import MarkdownContent from "@/components/MarkdownContent.vue";
import MarkdownEditor from "@/components/admin/MarkdownEditor.vue";
import TaskFormShell from "@/components/admin/TaskFormShell.vue";
import ConfirmDelete from "@/components/admin/ConfirmDelete.vue";

const route = useRoute();
const router = useRouter();

const courseSlug = computed(() => route.params.slug as string);
const lessonSlug = computed(() => route.params.lessonSlug as string);

const lesson = ref<AdminLessonWithTasks | null>(null);
const courseId = ref<string>("");
const error = ref<string | null>(null);
const saveBusy = ref(false);
const saveOk = ref(false);

const editingTaskId = ref<string | null>(null);
const showNewTask = ref(false);

const titleMn = ref("");
const titleEn = ref("");
const slug = ref("");
const duration = ref<number | null>(null);
const contentMd = ref("");

async function load() {
  try {
    const data = await getCourse(courseSlug.value);
    courseId.value = data.course.id;
    const found = data.lessons.find((l) => l.slug === lessonSlug.value);
    if (!found) {
      error.value = "Хичээл олдсонгүй";
      return;
    }
    lesson.value = found;
    titleMn.value = found.titleMn;
    titleEn.value = found.titleEn ?? "";
    slug.value = found.slug;
    duration.value = found.durationMin;
    contentMd.value = found.contentMd ?? "";
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Ачаалж чадсангүй";
  }
}

async function saveLesson() {
  if (!lesson.value) return;
  if (!titleMn.value.trim() || !slug.value.trim()) return;
  saveBusy.value = true;
  saveOk.value = false;
  error.value = null;
  try {
    await updateLesson(lesson.value.id, {
      titleMn: titleMn.value.trim(),
      titleEn: titleEn.value.trim() || null,
      slug: slug.value.trim(),
      durationMin: duration.value ?? undefined,
      contentMd: contentMd.value,
    });
    saveOk.value = true;
    setTimeout(() => (saveOk.value = false), 2000);
    if (slug.value !== lesson.value.slug) {
      router.replace(`/admin/courses/${courseSlug.value}/lessons/${slug.value}`);
    } else {
      await load();
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Хадгалж чадсангүй";
  } finally {
    saveBusy.value = false;
  }
}

async function onCreateTask(body: Parameters<typeof createTask>[1]) {
  if (!lesson.value) return;
  try {
    await createTask(lesson.value.id, body);
    showNewTask.value = false;
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Даалгавар нэмэх амжилтгүй";
  }
}

async function onUpdateTask(taskId: string, body: Parameters<typeof updateTask>[1]) {
  try {
    await updateTask(taskId, body);
    editingTaskId.value = null;
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Засаж чадсангүй";
  }
}

async function onDeleteTask(t: AdminTask) {
  try {
    await deleteTask(t.id);
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Устгаж чадсангүй";
  }
}

async function moveTask(t: AdminTask, dir: -1 | 1) {
  if (!lesson.value) return;
  const list = lesson.value.tasks;
  const i = list.findIndex((x) => x.id === t.id);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  const a = list[i].sortOrder;
  const b = list[j].sortOrder;
  try {
    await Promise.all([
      updateTask(list[i].id, { sortOrder: b }),
      updateTask(list[j].id, { sortOrder: a }),
    ]);
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Эрэмбэлж чадсангүй";
  }
}

onMounted(load);
watch([courseSlug, lessonSlug], load);

const KIND_LABEL: Record<string, string> = {
  quiz_single: "Quiz · нэг",
  quiz_multi: "Quiz · олон",
  prompt_exercise: "Prompt",
  reflection: "Тунгаалт",
};

const defaultTaskSort = computed(() => (lesson.value?.tasks.length ?? 0) * 10 + 10);
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6">
    <p class="mb-4">
      <RouterLink
        :to="`/admin/courses/${courseSlug}`"
        class="inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
      >
        ← Курсэд буцах
      </RouterLink>
    </p>

    <p v-if="error" class="mb-4 rounded-lg border border-accent bg-overlay px-4 py-2.5 text-sm">
      {{ error }}
    </p>

    <template v-if="lesson">
      <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-heading text-2xl font-bold tracking-tight">Хичээл засах</h1>
        <RouterLink
          :to="`/courses/${courseSlug}/lessons/${lesson.slug}`"
          target="_blank"
          class="text-sm text-accent hover:underline"
        >
          Нийтийн хуудсыг харах →
        </RouterLink>
      </header>

      <!-- Lesson metadata + editor -->
      <section class="mb-8 rounded-2xl border border-border-token bg-panel p-5 sm:p-6">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-semibold">Гарчиг (MN)</label>
            <input
              v-model="titleMn"
              class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 text-sm focus:border-accent"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold">Title (EN)</label>
            <input
              v-model="titleEn"
              class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 text-sm focus:border-accent"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold">Slug</label>
            <input
              v-model="slug"
              class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 font-mono text-sm focus:border-accent"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold">Үргэлжлэх (мин)</label>
            <input
              v-model.number="duration"
              type="number"
              min="1"
              class="w-32 rounded-lg border border-border-token bg-surface px-3 py-2 text-sm focus:border-accent"
            />
          </div>
        </div>

        <div class="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-semibold">Markdown агуулга</label>
            <MarkdownEditor v-model="contentMd" :rows="22" />
          </div>
          <div>
            <p class="mb-1 text-xs font-semibold">Урьдчилан харах</p>
            <div class="rounded-xl border border-border-token bg-surface p-4 max-h-[40rem] overflow-y-auto">
              <MarkdownContent :md="contentMd" />
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-end gap-3">
          <span v-if="saveOk" class="text-xs text-accent">✓ Хадгалагдлаа</span>
          <button
            type="button"
            :disabled="saveBusy || !titleMn.trim() || !slug.trim()"
            class="rounded-full bg-accent px-5 py-2 text-sm font-medium text-on-accent hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            @click="saveLesson"
          >
            {{ saveBusy ? "Хадгалж байна…" : "Хадгалах" }}
          </button>
        </div>
      </section>

      <!-- Tasks -->
      <section>
        <header class="mb-3 flex items-center justify-between">
          <h2 class="font-heading text-xl font-bold">
            Даалгаврууд ({{ lesson.tasks.length }})
          </h2>
          <button
            type="button"
            class="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-on-accent hover:brightness-110"
            @click="showNewTask = !showNewTask"
          >
            {{ showNewTask ? "Хаах" : "+ Шинэ даалгавар" }}
          </button>
        </header>

        <TaskFormShell
          v-if="showNewTask"
          class="mb-4"
          :default-sort-order="defaultTaskSort"
          @submit="onCreateTask"
          @cancel="showNewTask = false"
        />

        <ol v-if="lesson.tasks.length" class="space-y-3">
          <li
            v-for="(t, i) in lesson.tasks"
            :key="t.id"
            class="rounded-2xl border border-border-token bg-panel shadow-[var(--shadow-card)]"
          >
            <div class="flex items-center gap-3 p-4">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                {{ i + 1 }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                  {{ KIND_LABEL[t.kind] || t.kind }} · {{ t.xpReward }} XP · {{ t.slug }}
                </p>
                <p class="mt-0.5 text-sm">{{ t.promptMn }}</p>
              </div>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="rounded-md border border-border-token bg-panel px-2 py-1 text-xs text-muted hover:border-accent"
                  @click="moveTask(t, -1)"
                >↑</button>
                <button
                  type="button"
                  class="rounded-md border border-border-token bg-panel px-2 py-1 text-xs text-muted hover:border-accent"
                  @click="moveTask(t, 1)"
                >↓</button>
                <button
                  type="button"
                  class="rounded-md border border-border-token bg-panel px-2.5 py-1 text-xs font-medium hover:border-accent hover:text-accent"
                  @click="editingTaskId = editingTaskId === t.id ? null : t.id"
                >
                  {{ editingTaskId === t.id ? "Хаах" : "Засах" }}
                </button>
                <ConfirmDelete
                  small
                  :label="'Энэ даалгаврыг устгах уу?'"
                  @confirm="onDeleteTask(t)"
                />
              </div>
            </div>
            <div v-if="editingTaskId === t.id" class="border-t border-border-token p-4">
              <TaskFormShell
                :initial="t"
                @submit="(body) => onUpdateTask(t.id, body)"
                @cancel="editingTaskId = null"
              />
            </div>
          </li>
        </ol>
        <p v-else class="text-sm text-muted">
          Даалгавар байхгүй. Дээрх товчоор анхны даалгаврыг үүсгэнэ үү.
        </p>
      </section>
    </template>
    <p v-else-if="!error" class="text-sm text-muted">Ачаалж байна…</p>
  </div>
</template>
