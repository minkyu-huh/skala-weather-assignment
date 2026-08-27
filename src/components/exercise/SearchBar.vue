<script setup>
defineEmits(['update-query'])

defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
  resultMessage: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="search-inner">
    <h3>도시 검색</h3>
    <el-input
      :model-value="currentQuery"
      size="large"
      clearable
      placeholder="서울, 제주처럼 도시 이름을 입력하세요"
      aria-label="검색할 도시 이름 입력"
      @update:model-value="$emit('update-query', $event)"
    >
      <template #prefix>🔍</template>
    </el-input>
    <p>
      검색 중인 도시: <strong>{{ currentQuery }}</strong>
    </p>
    <p v-if="resultMessage" class="search-status" aria-live="polite">{{ resultMessage }}</p>
  </div>
</template>

<style scoped>
.search-inner h3 {
  margin-top: 0;
}

.search-status {
  margin-bottom: 0;
  color: #475569;
  font-size: 0.9rem;
}
</style>
