<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { TASK_PRIORITIES, TASK_WORKFLOW_STATUSES, type CreateTaskInput, type Task, type UpdateTaskInput } from '@/api/tasks';
import AppSelect from '@/components/ui/AppSelect.vue';

const props = defineProps<{ task?: Task; submitting: boolean; submitLabel: string }>();
const emit = defineEmits<{ submit: [input: CreateTaskInput | UpdateTaskInput]; cancel: [] }>();

const title = ref('');
const description = ref('');
const priority = ref<CreateTaskInput['priority']>('Medium');
const workflowStatus = ref<NonNullable<UpdateTaskInput['workflowStatus']>>('Todo');
const plannedStartDate = ref('');
const dueDate = ref('');
const titleError = computed(() => title.value.trim() ? '' : 'Введите название задачи');
const dateError = computed(() => plannedStartDate.value && dueDate.value && plannedStartDate.value > dueDate.value ? 'Дата начала не может быть позже срока' : '');
const priorityOptions = TASK_PRIORITIES.map((value) => ({ value, label: { Low: 'Низкий', Medium: 'Средний', High: 'Высокий' }[value] }));
const workflowStatusOptions = TASK_WORKFLOW_STATUSES.map((value) => ({ value, label: { Todo: 'К выполнению', 'In Progress': 'В работе', Resolved: 'Решена', Closed: 'Закрыта', Rejected: 'Отклонена' }[value] }));

watch(
  () => props.task,
  (task) => {
    title.value = task?.title ?? '';
    description.value = task?.description ?? '';
    priority.value = task?.priority ?? 'Medium';
    workflowStatus.value = task?.workflowStatus ?? 'Todo';
    plannedStartDate.value = task?.plannedStartDate ?? '';
    dueDate.value = task?.dueDate ?? '';
  },
  { immediate: true },
);

function submit() {
  if (titleError.value || dateError.value) return;
  const input = {
    title: title.value.trim(),
    description: description.value.trim() || (props.task ? null : undefined),
    priority: priority.value,
    ...(plannedStartDate.value ? { plannedStartDate: plannedStartDate.value } : props.task ? { plannedStartDate: null } : {}),
    ...(dueDate.value ? { dueDate: dueDate.value } : props.task ? { dueDate: null } : {}),
    ...(props.task ? { workflowStatus: workflowStatus.value, expectedVersion: props.task.version } : {}),
  };
  emit('submit', input);
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submit">
    <label class="field-label">Название
      <input v-model="title" class="field-input" :class="{ 'border-rose-500': titleError }" autocomplete="off" autofocus />
      <span v-if="titleError" class="field-error">{{ titleError }}</span>
    </label>
    <label class="field-label">Описание
      <textarea v-model="description" class="field-input min-h-28 resize-y" placeholder="Добавьте контекст, который поможет выполнить задачу" />
    </label>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="field-label">Приоритет
        <AppSelect v-model="priority" :options="priorityOptions" placeholder="Выберите приоритет" />
      </label>
      <label v-if="task" class="field-label">Статус
        <AppSelect v-model="workflowStatus" :options="workflowStatusOptions" placeholder="Выберите статус" />
      </label>
    </div>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="field-label">Планируемое начало<input v-model="plannedStartDate" class="field-input" type="date" /></label>
      <label class="field-label">Срок выполнения<input v-model="dueDate" class="field-input" type="date" :min="plannedStartDate || undefined" /><span v-if="dateError" class="field-error">{{ dateError }}</span></label>
    </div>
    <div class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      <button type="button" class="button-secondary" :disabled="submitting" @click="emit('cancel')">Отмена</button>
      <button type="submit" class="button-primary" :disabled="submitting || Boolean(titleError) || Boolean(dateError)">{{ submitting ? 'Сохраняем…' : submitLabel }}</button>
    </div>
  </form>
</template>
