import { createRouter, createWebHistory } from 'vue-router';
import TaskDetailsPage from '@/pages/tasks/TaskDetailsPage.vue';
import TasksPage from '@/pages/tasks/TasksPage.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/tasks' },
    { path: '/tasks', component: TasksPage },
    { path: '/tasks/:id', component: TaskDetailsPage, props: true },
  ],
});
