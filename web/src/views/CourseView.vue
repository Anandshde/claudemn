<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { courseDisplayTitle, getCourse } from "@/api";

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const data = ref<Awaited<ReturnType<typeof getCourse>> | null>(null);
const error = ref<string | null>(null);

async function load() {
  error.value = null;
  data.value = null;
  try {
    data.value = await getCourse(slug.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Not found";
  }
}

onMounted(load);
watch(slug, load);
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pt-6 pb-12 sm:px-6">
    <p class="mb-4">
      <RouterLink
        to="/"
        class="inline-flex items-center gap-1 text-sm text-muted transition-all duration-200 hover:-translate-x-0.5 hover:text-accent"
      >
        ← Бүх хичээл
      </RouterLink>
    </p>

    <p
      v-if="error"
      class="mb-4 rounded-lg border border-accent bg-overlay px-4 py-2.5 text-sm animate-[fadeIn_0.3s_ease-out]"
    >
      {{ error }}
    </p>

    <template v-if="data">
      <div class="animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)]">
        <h1
          class="mb-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {{ courseDisplayTitle(data.course) }}
        </h1>
        <div class="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span
            class="rounded-full border border-border-token px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider"
          >
            {{ data.course.product }}
          </span>
          <span
            class="rounded-full border border-border-token bg-surface px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider"
          >
            {{ data.course.category }}
          </span>
          <a
            v-if="data.course.externalUrl"
            :href="data.course.externalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-accent transition-opacity hover:opacity-80"
          >
            Claude.com дээр нээх →
          </a>
        </div>
        <p
          v-if="data.course.summaryMn || data.course.summaryEn"
          class="mb-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
        >
          {{ data.course.summaryMn ?? data.course.summaryEn }}
        </p>
      </div>

      <section class="mt-8">
        <h2 class="mb-3 font-heading text-base font-bold uppercase tracking-wider text-muted">
          Хичээлүүд
        </h2>
        <ol
          v-if="data.lessons.length"
          class="stagger m-0 list-none space-y-2 p-0"
        >
          <li v-for="(l, i) in data.lessons" :key="l.id">
            <RouterLink
              :to="`/courses/${data.course.slug}/lessons/${l.slug}`"
              class="group flex items-center gap-3 rounded-xl border border-border-token bg-panel px-4 py-3 text-text shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent transition-transform duration-200 group-hover:scale-110"
              >
                {{ i + 1 }}
              </span>
              <span class="flex-1 font-medium">
                {{ l.titleMn || l.titleEn }}
              </span>
              <span v-if="l.durationMin" class="text-xs text-muted">
                {{ l.durationMin }} мин
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                class="shrink-0 text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </RouterLink>
          </li>
        </ol>
        <p v-else class="max-w-xl text-sm text-muted">
          Энэ хичээлийн агуулга удахгүй нэмэгдэх болно. Тийм болохоор Anthropic-ийн албан ёсны
          хуудсаар одоохондоо хандана уу.
        </p>
      </section>
    </template>

    <p v-else-if="!error" class="text-sm text-muted">Ачаалж байна…</p>
  </div>
</template>
