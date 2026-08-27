<script setup>
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from '@/components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="router-app">
    <header class="site-header">
      <RouterLink class="brand" :to="{ name: 'WeatherHome' }">생활 날씨</RouterLink>
      <nav aria-label="주요 메뉴">
        <RouterLink :to="{ name: 'WeatherHome' }">날씨 대시보드</RouterLink>
        <RouterLink :to="{ name: 'MyLocation' }">현재 위치</RouterLink>
        <RouterLink :to="{ name: 'WeatherAbout' }">서비스 소개</RouterLink>
      </nav>
      <UnitToggler />
    </header>

    <main class="route-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
@import '@/assets/exercise.css';

.router-app {
  max-width: 980px;
  margin: 0 auto;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin: 24px 0;
  padding: 16px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.brand {
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
}

.site-header nav {
  display: flex;
  gap: 8px;
}

.site-header nav a {
  padding: 8px 11px;
  border-radius: 8px;
  color: #475569;
  font-weight: 700;
}

.site-header nav a.router-link-exact-active {
  background: #dbeafe;
  color: #1d4ed8;
}

.route-content {
  padding-bottom: 40px;
}

@media (max-width: 680px) {
  .site-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .site-header nav {
    flex-wrap: wrap;
  }
}
</style>
