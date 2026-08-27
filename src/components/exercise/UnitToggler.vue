<script setup>
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span>날씨 단위</span>
    <el-button type="primary" plain round @click="configStore.toggleUnit">
      {{ configStore.unit === 'celsius' ? '섭씨 ℃' : '화씨 ℉' }}
    </el-button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
  color: #475569;
  font-size: 0.9rem;
  white-space: nowrap;
}
</style>
