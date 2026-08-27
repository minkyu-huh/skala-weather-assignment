<script setup>
defineProps({
  cityName: {
    type: String,
    required: true,
  },
  walkRecommendation: {
    type: String,
    required: true,
  },
  laundryRecommendation: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <el-card class="recommendation-card" shadow="never">
    <h3>생활 추천 · {{ cityName }}</h3>
    <div class="recommendation-item">
      <strong>산책</strong>
      <span>{{ walkRecommendation }}</span>
    </div>
    <div class="recommendation-item">
      <strong>빨래</strong>
      <span>{{ laundryRecommendation }}</span>
    </div>
  </el-card>
</template>

<style scoped>
.recommendation-card {
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.84);
  backdrop-filter: blur(12px);
}

.recommendation-card :deep(.el-card__body) {
  padding: 18px;
}

.recommendation-card h3 {
  margin-top: 0;
}

.recommendation-item {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.3);
}

.recommendation-item strong {
  color: #1d4ed8;
}
</style>
