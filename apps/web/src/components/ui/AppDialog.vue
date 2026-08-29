<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import { X } from 'lucide-vue-next';

defineProps<{ open: boolean; title: string; description?: string }>();
const emit = defineEmits<{ 'update:open': [value: boolean] }>();
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="dialog-backdrop" />
      <DialogContent class="dialog-panel">
        <div class="mb-6 flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="text-xl font-semibold text-slate-950">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="mt-1 text-sm leading-6 text-slate-600">{{ description }}</DialogDescription>
          </div>
          <DialogClose class="touch-target rounded-xl p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Закрыть">
            <X :size="20" />
          </DialogClose>
        </div>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
