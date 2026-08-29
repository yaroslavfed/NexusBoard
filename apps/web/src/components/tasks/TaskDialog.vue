<script setup lang="ts">
import { type CreateTaskInput, type Task, type UpdateTaskInput } from '@/api/tasks';
import AppDialog from '@/components/ui/AppDialog.vue';
import TaskForm from './TaskForm.vue';

defineProps<{ open: boolean; task?: Task; submitting: boolean }>();
const emit = defineEmits<{ close: []; submit: [input: CreateTaskInput | UpdateTaskInput] }>();
</script>

<template>
  <AppDialog :open="open" :title="task ? 'Редактирование задачи' : 'Новая задача'" :description="task ? 'Изменения будут сохранены после отправки формы' : 'Добавьте основную информацию, остальное можно изменить позже'" @update:open="!$event && emit('close')">
    <TaskForm :task="task" :submitting="submitting" :submit-label="task ? 'Сохранить изменения' : 'Создать задачу'" @cancel="emit('close')" @submit="emit('submit', $event)" />
  </AppDialog>
</template>
