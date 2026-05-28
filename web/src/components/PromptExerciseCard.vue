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
const charsLeft = computed(() =>
  Math.max(0, minChars.value - text.value.length),
);

function onSubmit() {
  if (props.locked) return;
  if (text.value.length < minChars.value) return;
  emit("submit", { text: text.value });
}
</script>

<template>
  <div>
    <p class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
      Дасгал
    </p>
    <p class="mb-4 font-heading text-lg font-semibold text-text">
      {{ task.promptMn }}
    </p>
    <p
      v-if="task.payload.rubricMn"
      class="mb-3 text-sm text-muted"
    >
      <span class="font-semibold text-text">Шалгуур:</span>
      {{ task.payload.rubricMn }}
    </p>

    <textarea
      v-model="text"
      :disabled="locked"
      rows="5"
      class="mb-2 w-full rounded-xl border border-border-token bg-panel px-4 py-3 font-body text-sm leading-relaxed text-text focus:border-accent focus:outline-none disabled:opacity-70"
      placeholder="Хариултаа бичнэ үү..."
    />
    <p class="mb-4 text-xs text-muted">
      {{ text.length }} тэмдэгт
      <span v-if="charsLeft > 0">
        · хамгийн багадаа {{ minChars }} ({{ charsLeft }} дутуу)
      </span>
    </p>

    <div
      v-if="result"
      :class="[
        'mb-4 rounded-xl border px-4 py-3 text-sm',
        result.correct
          ? 'border-[color-mix(in_srgb,#2f7d4f_55%,var(--surface))] bg-[color-mix(in_srgb,#2f7d4f_12%,var(--surface))] text-text'
          : 'border-[color-mix(in_srgb,#b3463d_55%,var(--surface))] bg-[color-mix(in_srgb,#b3463d_12%,var(--surface))] text-text',
      ]"
    >
      <p class="mb-1 font-semibold">
        {{ result.correct ? "Сайн бичсэн ✓" : "Шалгуурт хүрсэнгүй" }}
      </p>
      <p v-if="result.explanationMn" class="text-muted">{{ result.explanationMn }}</p>
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
