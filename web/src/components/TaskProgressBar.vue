<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  total: number;
  done: number;
  xpThisLesson: number;
}>();

const pct = computed(() =>
  props.total > 0 ? Math.round((props.done / props.total) * 100) : 0,
);
</script>

<template>
  <div class="mb-5">
    <div class="mb-2 flex items-center justify-between text-xs text-muted">
      <span>{{ done }} / {{ total }} даалгавар</span>
      <span v-if="xpThisLesson > 0">+{{ xpThisLesson }} XP</span>
    </div>
    <div class="h-1.5 w-full overflow-hidden rounded-full bg-overlay">
      <div
        class="h-full bg-accent transition-all duration-500"
        :style="{ width: `${pct}%` }"
      />
    </div>
  </div>
</template>
