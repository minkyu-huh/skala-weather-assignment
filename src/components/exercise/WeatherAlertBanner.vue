<script setup>
defineProps({
  status: {
    type: String,
    required: true,
  },
})

const warningMessage = {
  비: '비가 예보되어 있습니다. 이동할 때 우산을 준비하세요.',
  눈: '눈이 예보되어 있습니다. 미끄러운 길을 주의하세요.',
  태풍: '태풍이 예보되어 있습니다. 불필요한 외출을 피하세요.',
  뇌우: '뇌우가 예보되어 있습니다. 안전한 실내에 머무르세요.',
  강풍: '강한 바람과 비가 예보되어 있습니다. 야외 활동을 주의하세요.',
}
</script>

<template>
  <el-alert
    v-if="warningMessage[status]"
    class="weather-alert"
    title="위험기상 알림"
    :description="warningMessage[status]"
    type="error"
    effect="light"
    show-icon
    :closable="false"
  />
</template>

<style scoped>
.weather-alert {
  border: 1px solid rgba(254, 202, 202, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(12px);
}
</style>
