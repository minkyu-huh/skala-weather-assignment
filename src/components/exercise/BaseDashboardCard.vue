<template>
  <el-card class="base-dashboard-card" shadow="never">
    <slot></slot>
  </el-card>
</template>

<style scoped>
.base-dashboard-card {
  margin-bottom: 15px;
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(12px);
}

.base-dashboard-card :deep(.el-card__body) {
  padding: 18px;
}
</style>
