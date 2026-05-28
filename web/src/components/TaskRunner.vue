<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { LessonTask } from "@/api";
import { useAcademy } from "@/academy/store";
import type { TaskAnswer, SubmitResult } from "@/academy/tasks";
import QuizCard from "@/components/QuizCard.vue";
import PromptExerciseCard from "@/components/PromptExerciseCard.vue";
import ReflectionCard from "@/components/ReflectionCard.vue";
import TaskProgressBar from "@/components/TaskProgressBar.vue";
import AcademyOnboarding from "@/components/AcademyOnboarding.vue";

const props = defineProps<{
  tasks: LessonTask[];
  courseId: string;
  courseSlug: string;
  lessonId: string;
}>();

const academy = useAcademy();

type Result = { correct: boolean; explanationMn?: string };

/** Per-task: locked once correctly submitted; result is shown afterwards. */
const results = reactive<Record<string, Result | null>>({});
const submitting = ref<string | null>(null);
const xpThisLesson = ref(0);

function syncFromProgress() {
  for (const t of props.tasks) {
    const done = academy.progress.value[props.courseId]?.[`task:${t.id}`];
    if (done && !results[t.id]) {
      results[t.id] = { correct: true };
    }
  }
}

watch(
  [() => props.tasks, () => academy.progress.value],
  () => syncFromProgress(),
  { immediate: true },
);

const total = computed(() => props.tasks.length);
const done = computed(() =>
  props.tasks.filter((t) => results[t.id]?.correct).length,
);
const allDone = computed(() => total.value > 0 && done.value === total.value);

function isLocked(taskId: string): boolean {
  return !!results[taskId]?.correct;
}

async function onSubmit(task: LessonTask, answer: TaskAnswer) {
  if (!academy.profile.value) return;
  if (submitting.value) return;
  if (isLocked(task.id)) return;

  submitting.value = task.id;
  try {
    const r: SubmitResult | null = await academy.submitTask(
      props.courseId,
      task.id,
      answer,
    );
    if (!r) return;
    results[task.id] = { correct: r.correct, explanationMn: r.explanationMn };
    if (r.correct && r.xpAwarded > 0) {
      xpThisLesson.value += r.xpAwarded;
    }
  } finally {
    submitting.value = null;
  }
}
</script>

<template>
  <section>
    <header class="mb-5">
      <h2 class="font-heading text-xl font-bold text-text sm:text-2xl">
        Даалгаврууд
      </h2>
      <p class="mt-1 text-sm text-muted">
        Хичээлийг бататгахын тулд дараах даалгавруудыг гүйцэтгэ.
      </p>
    </header>

    <div v-if="!academy.profile.value" class="mb-5">
      <AcademyOnboarding />
    </div>

    <template v-else>
      <TaskProgressBar
        :total="total"
        :done="done"
        :xp-this-lesson="xpThisLesson"
      />

      <ol class="space-y-5">
        <li
          v-for="(task, i) in tasks"
          :key="task.id"
          class="rounded-2xl border border-border-token bg-panel p-5 sm:p-6 shadow-[var(--shadow-card)]"
          :class="{ 'ring-1 ring-accent': isLocked(task.id) }"
        >
          <p class="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            #{{ i + 1 }} · +{{ task.xpReward }} XP
          </p>

          <QuizCard
            v-if="task.kind === 'quiz_single' || task.kind === 'quiz_multi'"
            :task="task"
            :locked="isLocked(task.id)"
            :result="results[task.id]"
            @submit="(a) => onSubmit(task, a)"
          />
          <PromptExerciseCard
            v-else-if="task.kind === 'prompt_exercise'"
            :task="task"
            :locked="isLocked(task.id)"
            :result="results[task.id]"
            @submit="(a) => onSubmit(task, a)"
          />
          <ReflectionCard
            v-else-if="task.kind === 'reflection'"
            :task="task"
            :locked="isLocked(task.id)"
            :result="results[task.id]"
            @submit="(a) => onSubmit(task, a)"
          />
        </li>
      </ol>

      <div
        v-if="allDone"
        class="mt-6 rounded-2xl border border-accent bg-overlay px-5 py-4 text-center"
      >
        <p class="font-heading text-lg font-bold text-text">
          Бүх даалгавар дууссан! 🎉
        </p>
        <p class="mt-1 text-sm text-muted">Дараагийн хичээл рүү шилжиж болно.</p>
      </div>
    </template>
  </section>
</template>
