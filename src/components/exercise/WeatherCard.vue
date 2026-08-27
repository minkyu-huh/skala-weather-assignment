<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])

const configStore = useConfigStore()

// 원본 Mock/API 데이터는 섭씨로 유지하고 화면에 표시할 때만 단위를 변환한다.
const displayTemp = computed(() => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((props.cityItem.temp * 9) / 5 + 32)
  }
  return props.cityItem.temp
})
</script>

<template>
  <el-card class="weather-card" shadow="hover" @click="emit('select-card', cityItem)">
    <div class="card-heading">
      <div>
        <h4>{{ cityItem.name }}</h4>
        <p>{{ cityItem.status }} · {{ displayTemp }}{{ configStore.unitSymbol }}</p>
      </div>
      <el-button type="primary" plain size="small" @click.stop="emit('click-detail', cityItem)">상세보기</el-button>
    </div>

    <el-tag v-if="cityItem.temp >= 25" type="danger" effect="light">🔥 더움</el-tag>
    <el-tag v-else type="primary" effect="light">❄️ 선선함</el-tag>
  </el-card>
</template>

<style scoped>
.weather-card {
  margin-bottom: 10px;
  border-radius: 12px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.weather-card:hover {
  border-color: #93c5fd;
  transform: translateY(-2px);
}

.weather-card :deep(.el-card__body) {
  padding: 14px 16px;
}

.card-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.card-heading h4,
.card-heading p {
  margin: 0 0 6px;
}
</style>
