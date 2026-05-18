<script setup lang="ts">
import { useAcademy } from "@/academy/store";

const { toast } = useAcademy();
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="toast"
      class="pointer-events-none fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-cream shadow-lg sm:bottom-10"
      role="status"
      aria-live="polite"
    >
      <span class="text-lg leading-none">{{ toast.icon }}</span>
      <span>{{ toast.text }}</span>
    </div>
  </Transition>
</template>
