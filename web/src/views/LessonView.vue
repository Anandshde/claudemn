<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { courseDisplayTitle, getLesson } from "@/api";

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
        ← {{ data ? courseDisplayTitle(data.course) : "Course" }}
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
        Lesson
      </p>
      <h1 class="mb-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {{ data.lesson.titleEn ?? data.lesson.titleMn }}
      </h1>
      <pre
        v-if="data.lesson.contentMd"
        class="whitespace-pre-wrap rounded-xl border border-border-token bg-panel p-5 font-body text-[0.95rem] leading-relaxed shadow-[var(--shadow-card)]"
        >{{ data.lesson.contentMd }}</pre
      >
      <p v-else class="text-sm text-muted">
        Content will appear here when you add lessons in D1.
      </p>
    </article>

    <p v-else-if="!error" class="text-sm text-muted">Loading…</p>
  </div>
</template>
