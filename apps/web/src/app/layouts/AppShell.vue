<script setup lang="ts">
import { CheckSquare, ClipboardList, LayoutDashboard, Menu, Settings } from 'lucide-vue-next';
import { ref } from 'vue';

const isMenuOpen = ref(false);
</script>

<template>
  <div class="app-background min-h-dvh text-slate-950">
    <header class="glass-header sticky top-0 z-20">
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <RouterLink to="/tasks" class="flex items-center gap-2 font-semibold tracking-tight">
          <span class="grid size-9 place-items-center rounded-xl bg-teal-700 text-white"><CheckSquare :size="20" /></span>
          NexusBoard
        </RouterLink>
        <div class="ml-auto hidden items-center gap-2 text-sm text-slate-500 sm:flex">
          <span class="size-2 rounded-full bg-emerald-500" /> API подключён через gateway
        </div>
        <button class="touch-target rounded-lg p-2 text-slate-600 sm:hidden" aria-label="Открыть меню" @click="isMenuOpen = !isMenuOpen">
          <Menu :size="22" />
        </button>
      </div>
    </header>

    <div class="mx-auto flex max-w-7xl">
      <aside class="glass-sidebar hidden w-56 shrink-0 px-3 py-6 md:block">
        <nav class="space-y-1">
          <RouterLink to="/tasks" class="nav-link"><ClipboardList :size="18" /> Задачи</RouterLink>
          <span class="nav-link cursor-not-allowed opacity-45"><LayoutDashboard :size="18" /> Обзор</span>
          <span class="nav-link cursor-not-allowed opacity-45"><Settings :size="18" /> Настройки</span>
        </nav>
      </aside>

      <main class="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-8"><RouterView /></main>
    </div>

    <nav v-if="isMenuOpen" class="glass-panel fixed inset-x-3 top-20 z-30 p-2 sm:hidden">
      <RouterLink class="nav-link" to="/tasks" @click="isMenuOpen = false"><ClipboardList :size="18" /> Задачи</RouterLink>
    </nav>
    <nav class="glass-bottom-nav fixed inset-x-0 bottom-0 z-20 flex px-3 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
      <RouterLink to="/tasks" class="mobile-nav-link"><ClipboardList :size="19" /> Задачи</RouterLink>
      <span class="mobile-nav-link cursor-not-allowed opacity-45"><LayoutDashboard :size="19" /> Обзор</span>
      <span class="mobile-nav-link cursor-not-allowed opacity-45"><Settings :size="19" /> Ещё</span>
    </nav>
  </div>
</template>
