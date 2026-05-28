<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ label: string; small?: boolean }>();
const emit = defineEmits<{ confirm: [] }>();

const open = ref(false);
const busy = ref(false);

async function onConfirm() {
  busy.value = true;
  try {
    emit("confirm");
  } finally {
    busy.value = false;
    open.value = false;
  }
}
</script>

<template>
  <button
    v-if="!open"
    type="button"
    :class="
      props.small
        ? 'rounded-md border border-border-token bg-panel px-2 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent'
        : 'rounded-full border border-border-token bg-panel px-3 py-1.5 text-xs font-medium text-muted hover:border-accent hover:text-accent'
    "
    @click="open = true"
  >
    Устгах
  </button>
  <span v-else class="inline-flex items-center gap-2">
    <span class="text-xs text-muted">{{ props.label }}</span>
    <button
      type="button"
      :disabled="busy"
      class="rounded-md bg-accent px-2 py-1 text-xs font-medium text-on-accent hover:brightness-110 disabled:opacity-50"
      @click="onConfirm"
    >
      Тийм
    </button>
    <button
      type="button"
      class="rounded-md border border-border-token px-2 py-1 text-xs"
      @click="open = false"
    >
      Үгүй
    </button>
  </span>
</template>
