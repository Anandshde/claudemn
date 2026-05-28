<script setup lang="ts">
import { computed, ref } from "vue";
import type { LessonTask } from "@/api";

const props = defineProps<{
  task: LessonTask;
  locked: boolean;
  result: { correct: boolean; explanationMn?: string } | null;
}>();

const emit = defineEmits<{ submit: [answer: { text: string }] }>();

const text = ref("");
const minChars = computed(() => props.task.payload.minChars ?? 0);

function onSubmit() {
  if (props.locked) return;
  if (text.value.length < minChars.value) return;
  emit("submit", { text: text.value });
}
</script>

<template>
  <div>
    <p class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
      Тунгаалт
    </p>
    <p class="mb-4 font-heading text-lg font-semibold text-text">
      {{ task.promptMn }}
    </p>

    <textarea
      v-model="text"
      :disabled="locked"
      rows="4"
      class="mb-2 w-full rounded-xl border border-border-token bg-panel px-4 py-3 font-body text-sm leading-relaxed text-text focus:border-accent focus:outline-none disabled:opacity-70"
      placeholder="Бодол санаагаа бич..."
    />
    <p class="mb-4 text-xs text-muted">
      {{ text.length }} тэмдэгт
      <span v-if="text.length < minChars">
        · хамгийн багадаа {{ minChars }}
      </span>
    </p>

    <div
      v-if="result"
      class="mb-4 rounded-xl border border-[color-mix(in_srgb,#2f7d4f_55%,var(--surface))] bg-[color-mix(in_srgb,#2f7d4f_12%,var(--surface))] px-4 py-3 text-sm text-text"
    >
      <p class="font-semibold">Сайн бодлоо ✓</p>
    </div>

    <button
      v-if="!locked"
      type="button"
      :disabled="text.length < minChars"
      class="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      @click="onSubmit"
    >
      Илгээх
    </button>
  </div>
</template>
