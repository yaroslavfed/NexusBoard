<script setup lang="ts">
import { ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from 'reka-ui';

defineProps<{ message: string }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <ToastProvider>
    <ToastRoot :open="Boolean(message)" class="toast-root" :duration="4500" @update:open="!$event && emit('close')">
      <ToastTitle class="font-semibold text-slate-950">Готово</ToastTitle>
      <ToastDescription class="mt-1 text-sm text-slate-600">{{ message }}</ToastDescription>
    </ToastRoot>
    <ToastViewport class="toast-viewport" />
  </ToastProvider>
</template>
