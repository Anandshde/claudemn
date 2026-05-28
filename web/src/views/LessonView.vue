<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { courseDisplayTitle, getLesson } from "@/api";
import MarkdownContent from "@/components/MarkdownContent.vue";
import TaskRunner from "@/components/TaskRunner.vue";

const route = useRoute();
const courseSlug = computed(() => route.params.courseSlug as string);
const lessonSlug = computed(() => route.params.lessonSlug as string);

const data = ref<Awaited<ReturnType<typeof getLesson>> | null>(null);
const error = ref<string | null>(null);

async function load() {
  error.value = null;
  data.value = null;
  try {
    data.value = await getLesson(courseSlug.value, lessonSlug.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Not found";
  }
}

onMounted(load);
watch([courseSlug, lessonSlug], load);
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pt-6 pb-12 sm:px-6">
    <p class="mb-4">
      <RouterLink
        :to="`/courses/${courseSlug}`"
        class="inline-flex items-center gap-1 text-sm text-muted transition-all duration-200 hover:-translate-x-0.5 hover:text-accent"
      >
        ← {{ data ? courseDisplayTitle(data.course) : "Хичээл" }}
      </RouterLink>
    </p>

    <p
      v-if="error"
      class="mb-4 rounded-lg border border-accent bg-overlay px-4 py-2.5 text-sm animate-[fadeIn_0.3s_ease-out]"
    >
      {{ error }}
    </p>

    <article
      v-if="data"
      class="animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)]"
    >
      <p
        class="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted"
      >
        Хичээл
      </p>
      <h1 class="mb-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {{ data.lesson.titleMn || data.lesson.titleEn }}
      </h1>

      <div
        v-if="data.lesson.contentMd"
        class="rounded-xl border border-border-token bg-panel p-6 sm:p-7 shadow-[var(--shadow-card)]"
      >
        <MarkdownContent :md="data.lesson.contentMd" />
      </div>
      <p v-else class="text-sm text-muted">
        Энэ хичээлийн агуулга удахгүй нэмэгдэх болно.
      </p>

      <TaskRunner
        v-if="data.tasks && data.tasks.length"
        :tasks="data.tasks"
        :course-id="data.course.id"
        :course-slug="data.course.slug"
        :lesson-id="data.lesson.id"
        class="mt-8"
      />
    </article>

    <p v-else-if="!error" class="text-sm text-muted">Ачаалж байна…</p>
  </div>
</template>
