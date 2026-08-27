<script setup lang="ts">
import { ArrowLeft, Pencil, RefreshCw, Trash2 } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { type Task, type UpdateTaskInput } from '@/api/tasks';
import { useDeleteTask, useTask, useUpdateTask } from '@/api/queries/tasks';
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog.vue';
import TaskDialog from '@/components/tasks/TaskDialog.vue';

const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id));
const taskQuery = useTask(id);
const updateTask = useUpdateTask(id.value);
const deleteTask = useDeleteTask();
const isEditDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const notice = ref('');
const statusLabel = { Todo: 'К выполнению', 'In Progress': 'В работе', Done: 'Готово' };
const priorityLabel = { Low: 'Низкий', Medium: 'Средний', High: 'Высокий' };
const statusClass = { Todo: 'status-todo', 'In Progress': 'status-progress', Done: 'status-done' };

function formatDate(value: string) { return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)); }
async function save(input: UpdateTaskInput) { try { await updateTask.mutateAsync(input); isEditDialogOpen.value = false; notice.value = 'Изменения сохранены'; } catch { notice.value = 'Не удалось сохранить изменения. Повторите попытку'; } }
async function remove() { try { await deleteTask.mutateAsync(id.value); await router.push('/tasks'); } catch { isDeleteDialogOpen.value = false; notice.value = 'Не удалось удалить задачу. Повторите попытку'; } }
</script>

<template>
  <section class="space-y-6">
    <RouterLink to="/tasks" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700"><ArrowLeft :size="18" /> Все задачи</RouterLink>
    <div v-if="taskQuery.isPending.value" class="space-y-4"><div class="h-10 w-2/3 animate-pulse rounded bg-slate-200" /><div class="h-56 animate-pulse rounded-xl bg-slate-200" /></div>
    <div v-else-if="taskQuery.isError.value" class="empty-state"><RefreshCw :size="30" /><h1>Не удалось открыть задачу</h1><p>Возможно, она была удалена или API временно недоступен</p><button class="button-secondary" @click="taskQuery.refetch()">Повторить</button></div>
    <template v-else-if="taskQuery.data.value">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div class="min-w-0"><p class="eyebrow">Задача</p><h1 class="mt-1 break-words text-3xl font-bold tracking-tight">{{ taskQuery.data.value.title }}</h1></div><div class="flex gap-2"><button class="button-secondary" @click="isEditDialogOpen = true"><Pencil :size="17" /> Изменить</button><button class="button-danger-icon" aria-label="Удалить задачу" @click="isDeleteDialogOpen = true"><Trash2 :size="18" /></button></div></div>
      <div v-if="notice" class="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900" role="status">{{ notice }}</div>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div class="flex flex-wrap gap-2"><span class="badge" :class="statusClass[taskQuery.data.value.status]">{{ statusLabel[taskQuery.data.value.status] }}</span><span class="badge" :class="`priority-${taskQuery.data.value.priority}`">{{ priorityLabel[taskQuery.data.value.priority] }}</span></div><div class="mt-7 whitespace-pre-wrap leading-7 text-slate-700">{{ taskQuery.data.value.description || 'Описание не добавлено' }}</div><dl class="mt-8 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2"><div><dt class="text-slate-500">Создана</dt><dd class="mt-1 font-medium">{{ formatDate(taskQuery.data.value.createdAt) }}</dd></div><div><dt class="text-slate-500">Последнее изменение</dt><dd class="mt-1 font-medium">{{ formatDate(taskQuery.data.value.updatedAt) }}</dd></div></dl></article>
      <TaskDialog :open="isEditDialogOpen" :task="taskQuery.data.value as Task" :submitting="updateTask.isPending.value" @close="isEditDialogOpen = false" @submit="save($event as UpdateTaskInput)" />
      <DeleteTaskDialog :open="isDeleteDialogOpen" :title="taskQuery.data.value.title" :deleting="deleteTask.isPending.value" @close="isDeleteDialogOpen = false" @confirm="remove" />
    </template>
  </section>
</template>
