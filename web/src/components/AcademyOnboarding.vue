<script setup lang="ts">
import { ref } from "vue";
import { useAcademy } from "@/academy/store";

const { onboard, loading } = useAcademy();
const name = ref("");

async function submit() {
  const v = name.value.trim();
  if (!v) return;
  await onboard(v);
}
</script>

<template>
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/60 px-4 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
    role="dialog"
    aria-modal="true"
    aria-labelledby="academy-onboarding-title"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-border-token bg-panel p-8 shadow-[var(--shadow-card)] animate-[fadeUp_0.4s_cubic-bezier(0.22,1,0.36,1)]"
    >
      <div
        class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-charcoal text-cream"
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zm6 9l.8 2.2L21 15l-2.2.8L18 18l-.8-2.2L15 15l2.2-.8L18 12z"
          />
        </svg>
      </div>
      <p class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
        Anthropic Академи
      </p>
      <h1
        id="academy-onboarding-title"
        class="mb-3 font-heading text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl"
      >
        Тавтай морил<span class="text-accent">.</span>
      </h1>
      <p class="mb-6 text-sm leading-relaxed text-muted">
        Claude-ыг эзэмших аяллаа эхлүүлэгтсэе. Зөвхөн нэрээ оруулна уу — таны нэр зөвхөн
        энэ төхөөрөмж дээр хадгалагдана.
      </p>
      <form @submit.prevent="submit">
        <input
          v-model="name"
          type="text"
          placeholder="Нэрээ оруулна уу"
          maxlength="32"
          autofocus
          class="mb-3 w-full rounded-lg border border-border-token bg-surface px-4 py-3 text-sm text-text outline-none transition-all duration-200 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          :disabled="!name.trim() || loading"
          class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-charcoal px-5 py-3 text-sm font-semibold text-cream transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-cream dark:text-charcoal"
        >
          <span>{{ loading ? "Уншиж байна…" : "Эхлүүлэх" }}</span>
          <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </form>
      <p class="mt-5 text-center text-xs text-muted">
        Таны өгөгдөл зөвхөн энэ төхөөрөмж дээр хадгалагдана.
      </p>
    </div>
  </div>
</template>
