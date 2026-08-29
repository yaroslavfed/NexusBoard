<script setup lang="ts">
import { Archive, ArrowLeft, CalendarDays, LockKeyhole, Pencil, RefreshCw } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ApiError, type Task, type UpdateTaskInput } from '@/api/tasks';
import { useArchiveTask, useTask, useUpdateTask } from '@/api/queries/tasks';
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog.vue';
import TaskDialog from '@/components/tasks/TaskDialog.vue';
import AppToast from '@/components/ui/AppToast.vue';

const route = useRoute();
const id = computed(() => String(route.params.id));
const taskQuery = useTask(id);
const updateTask = useUpdateTask();
const archiveTask = useArchiveTask();
const isEditDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const notice = ref('');
const statusLabel = { Todo: 'К выполнению', 'In Progress': 'В работе', Resolved: 'Решена', Closed: 'Закрыта', Rejected: 'Отклонена' };
const priorityLabel = { Low: 'Низкий', Medium: 'Средний', High: 'Высокий' };
const statusClass = { Todo: 'status-todo', 'In Progress': 'status-progress', Resolved: 'status-resolved', Closed: 'status-closed', Rejected: 'status-rejected' };
const isFrozen = computed(() => taskQuery.data.value?.workflowStatus === 'Closed' || taskQuery.data.value?.workflowStatus === 'Rejected');

function formatDate(value: string) { return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)); }
function errorMessage(error: unknown, defaultMessage: string) { return error instanceof ApiError && error.status === 409 ? 'Задача уже изменилась. Обновите страницу и повторите действие' : defaultMessage; }
async function save(input: UpdateTaskInput) { try { await updateTask.mutateAsync({ id: id.value, input }); isEditDialogOpen.value = false; notice.value = 'Изменения сохранены'; } catch (error) { notice.value = errorMessage(error, 'Не удалось сохранить изменения. Повторите попытку'); } }
async function archive() { const task = taskQuery.data.value; if (!task) return; try { await archiveTask.mutateAsync({ id: task.id, expectedVersion: task.version }); isDeleteDialogOpen.value = false; notice.value = 'Задача перемещена в архив'; } catch (error) { isDeleteDialogOpen.value = false; notice.value = errorMessage(error, 'Не удалось архивировать задачу. Повторите попытку'); } }
</script>

<template>
  <section class="space-y-6">
    <RouterLink to="/tasks" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700"><ArrowLeft :size="18" /> Все задачи</RouterLink>
    <div v-if="taskQuery.isPending.value" class="space-y-4"><div class="h-10 w-2/3 animate-pulse rounded bg-slate-200" /><div class="h-56 animate-pulse rounded-xl bg-slate-200" /></div>
    <div v-else-if="taskQuery.isError.value" class="empty-state"><RefreshCw :size="30" /><h1>Не удалось открыть задачу</h1><p>Возможно, она была удалена или API временно недоступен</p><button class="button-secondary" @click="taskQuery.refetch()">Повторить</button></div>
    <template v-else-if="taskQuery.data.value">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div class="min-w-0"><p class="eyebrow">Задача</p><h1 class="mt-1 break-words text-3xl font-bold tracking-tight">{{ taskQuery.data.value.title }}</h1></div><div class="flex gap-2"><button v-if="!isFrozen" class="button-secondary" :disabled="taskQuery.data.value.lifecycleStatus === 'Archived'" @click="isEditDialogOpen = true"><Pencil :size="17" /> Изменить</button><button v-if="taskQuery.data.value.lifecycleStatus === 'Active'" class="button-secondary" aria-label="Архивировать задачу" @click="isDeleteDialogOpen = true"><Archive :size="18" /> Архивировать</button></div></div>
      <div v-if="isFrozen" class="glass-panel flex items-center gap-3 px-4 py-3 text-sm text-slate-700"><LockKeyhole :size="18" class="shrink-0 text-slate-500" /> Задача в конечном статусе защищена от изменений правилами backend</div>
      <article class="glass-panel p-5 sm:p-7"><div class="flex flex-wrap gap-2"><span class="badge" :class="statusClass[taskQuery.data.value.workflowStatus]">{{ statusLabel[taskQuery.data.value.workflowStatus] }}</span><span v-if="taskQuery.data.value.lifecycleStatus === 'Archived'" class="badge status-archived">В архиве</span><span class="badge" :class="`priority-${taskQuery.data.value.priority}`">{{ priorityLabel[taskQuery.data.value.priority] }}</span></div><div class="mt-7 whitespace-pre-wrap leading-7 text-slate-700">{{ taskQuery.data.value.description || 'Описание не добавлено' }}</div><dl class="mt-8 grid gap-4 border-t border-slate-200/70 pt-5 text-sm sm:grid-cols-2"><div><dt class="text-slate-500">Создана</dt><dd class="mt-1 font-medium">{{ formatDate(taskQuery.data.value.createdAt) }}</dd></div><div><dt class="text-slate-500">Последнее изменение</dt><dd class="mt-1 font-medium">{{ formatDate(taskQuery.data.value.updatedAt) }}</dd></div><div v-if="taskQuery.data.value.plannedStartDate"><dt class="flex items-center gap-1 text-slate-500"><CalendarDays :size="15" /> Планируемое начало</dt><dd class="mt-1 font-medium">{{ taskQuery.data.value.plannedStartDate }}</dd></div><div v-if="taskQuery.data.value.dueDate"><dt class="flex items-center gap-1 text-slate-500"><CalendarDays :size="15" /> Срок выполнения</dt><dd class="mt-1 font-medium">{{ taskQuery.data.value.dueDate }}</dd></div></dl></article>
      <TaskDialog :open="isEditDialogOpen" :task="taskQuery.data.value as Task" :submitting="updateTask.isPending.value" @close="isEditDialogOpen = false" @submit="save($event as UpdateTaskInput)" />
      <DeleteTaskDialog :open="isDeleteDialogOpen" :title="taskQuery.data.value.title" :deleting="archiveTask.isPending.value" @close="isDeleteDialogOpen = false" @confirm="archive" />
    </template>
  </section>
  <AppToast :message="notice" @close="notice = ''" />
</template>
