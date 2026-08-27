<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LifeRecommendationCard from '@/components/exercise/LifeRecommendationCard.vue'
import WeatherAlertBanner from '@/components/exercise/WeatherAlertBanner.vue'
import WeatherScene from '@/components/exercise/weather-effects/WeatherScene.vue'
import { mockHourlyForecast, mockWeatherList } from '@/data/mockWeather'
import { findWeatherCity } from '@/data/weatherCities'
import { fetchWeatherByCoordinates } from '@/services/weatherApi'
import { useConfigStore } from '@/stores/configStore'
import { getLaundryRecommendation, getWalkRecommendation } from '@/utils/weatherRecommendations'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const weatherBundle = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const cityDefinition = computed(() => findWeatherCity(route.params.cityId))
const fallbackCity = computed(() => mockWeatherList.find((item) => item.id === route.params.cityId))
const city = computed(() => weatherBundle.value?.city ?? fallbackCity.value)
const hourlyForecast = computed(() => weatherBundle.value?.hourlyForecast ?? mockHourlyForecast[route.params.cityId] ?? [])
const weatherSceneClass = computed(() => (city.value ? `scene-${city.value.theme}` : 'scene-cloudy'))
const walkRecommendation = computed(() => getWalkRecommendation(hourlyForecast.value))
const laundryRecommendation = computed(() => getLaundryRecommendation(hourlyForecast.value))

const formatTemperature = (celsius) => {
  const value = configStore.unit === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : celsius
  return `${value}${configStore.unitSymbol}`
}

const pm10Status = computed(() => {
  const value = city.value?.pm10 ?? hourlyForecast.value[0]?.pm10
  if (value === undefined) return '데이터 없음'
  if (value <= 30) return '좋음'
  if (value <= 80) return '보통'
  if (value <= 150) return '나쁨'
  return '매우 나쁨'
})

const pm25Status = computed(() => {
  const value = city.value?.pm25 ?? hourlyForecast.value[0]?.pm25
  if (value === undefined) return '데이터 없음'
  if (value <= 15) return '좋음'
  if (value <= 35) return '보통'
  if (value <= 75) return '나쁨'
  return '매우 나쁨'
})

const loadDetailWeather = async () => {
  weatherBundle.value = null
  errorMessage.value = ''

  if (!cityDefinition.value) return

  isLoading.value = true
  try {
    weatherBundle.value = await fetchWeatherByCoordinates(cityDefinition.value)
    if (weatherBundle.value.openWeatherFailed) {
      errorMessage.value = 'OpenWeather 요청이 실패해 Open-Meteo 실제 데이터로 표시합니다.'
    }
  } catch {
    errorMessage.value = '실제 데이터를 불러오지 못해 이 도시의 Mock 데이터를 표시합니다.'
  } finally {
    isLoading.value = false
  }
}

// URL의 cityId가 바뀌면 같은 View에서 해당 도시 데이터를 다시 요청한다.
watch(() => route.params.cityId, loadDetailWeather, { immediate: true })
</script>

<template>
  <div class="detail-scene" :class="weatherSceneClass">
    <WeatherScene v-if="city" :theme="city.theme" />

    <div v-if="city" class="detail-content">
      <el-card v-if="isLoading" class="detail-card loading-card" shadow="never">
        <el-skeleton :rows="7" animated />
      </el-card>

      <template v-else>
        <WeatherAlertBanner :status="city.alertStatus ?? city.status" />

        <div v-if="errorMessage" class="api-error" role="status">
          <el-alert :title="errorMessage" type="warning" show-icon :closable="false" />
          <el-button type="warning" plain @click="loadDetailWeather">다시 불러오기</el-button>
        </div>

        <el-card class="detail-header" shadow="never">
          <p>도시 상세 날씨</p>
          <h2>{{ city.name }} · {{ city.status }}</h2>
          <strong>{{ formatTemperature(city.temp) }}</strong>
          <div class="current-extra">
            <span v-if="city.humidity !== undefined">현재 습도 {{ city.humidity }}%</span>
            <span v-if="city.windSpeed !== undefined">풍속 {{ city.windSpeed }}m/s</span>
            <span v-if="weatherBundle">{{ weatherBundle.source }} · {{ weatherBundle.updatedAt }} 갱신</span>
          </div>
        </el-card>

        <el-card class="detail-card" shadow="never">
          <h3>시간별 날씨와 강우 확률</h3>
          <el-table :data="hourlyForecast" stripe border table-layout="auto" class="hourly-table">
            <el-table-column prop="time" label="시간" min-width="105" />
            <el-table-column prop="status" label="날씨" min-width="75" />
            <el-table-column label="기온" min-width="75">
              <template #default="{ row }">{{ formatTemperature(row.temp) }}</template>
            </el-table-column>
            <el-table-column label="강우" min-width="70">
              <template #default="{ row }">{{ row.rainProbability }}%</template>
            </el-table-column>
            <el-table-column label="습도" min-width="70">
              <template #default="{ row }">{{ row.humidity }}%</template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card class="detail-card air-quality" shadow="never">
          <h3>대기질</h3>
          <div>
            <span>미세먼지</span>
            <strong>{{ city.pm10 ?? hourlyForecast[0]?.pm10 ?? '-' }}㎍/㎥ · {{ pm10Status }}</strong>
          </div>
          <div>
            <span>초미세먼지</span>
            <strong>{{ city.pm25 ?? hourlyForecast[0]?.pm25 ?? '-' }}㎍/㎥ · {{ pm25Status }}</strong>
          </div>
        </el-card>

        <LifeRecommendationCard
          :city-name="city.name"
          :walk-recommendation="walkRecommendation"
          :laundry-recommendation="laundryRecommendation"
        />

        <el-button class="back-button" type="primary" size="large" @click="router.push({ name: 'WeatherHome' })">
          메인 대시보드로 돌아가기
        </el-button>
      </template>
    </div>

    <div v-else class="not-found-card">
      <el-empty description="도시 정보를 찾을 수 없습니다.">
        <el-button type="primary" @click="router.push({ name: 'WeatherHome' })">메인으로 이동</el-button>
      </el-empty>
    </div>
  </div>
</template>

<style scoped>
.detail-scene {
  position: relative;
  min-height: 760px;
  padding: 32px;
  overflow: hidden;
  border-radius: 24px;
  isolation: isolate;
}

.scene-sunny {
  background: linear-gradient(160deg, #60a5fa 0%, #bae6fd 52%, #fef3c7 100%);
}

.scene-cloudy {
  background: linear-gradient(160deg, #64748b 0%, #94a3b8 52%, #cbd5e1 100%);
}

.scene-rain {
  background: linear-gradient(160deg, #1e3a5f 0%, #476582 58%, #8da5b9 100%);
}

.scene-snow {
  background: linear-gradient(160deg, #93c5fd 0%, #dbeafe 52%, #f8fafc 100%);
}

.scene-storm {
  background: linear-gradient(160deg, #111827 0%, #303b4f 55%, #5f6b7c 100%);
}

.detail-content {
  position: relative;
  z-index: 1;
  display: grid;
  max-width: 720px;
  gap: 16px;
  margin: 0 auto;
}

.detail-header,
.detail-card,
.not-found-card {
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.88);
  backdrop-filter: blur(12px);
}

.detail-header :deep(.el-card__body),
.detail-card :deep(.el-card__body) {
  padding: 20px;
}

.detail-header p,
.detail-header h2 {
  margin: 0 0 8px;
}

.detail-header > strong {
  font-size: 2rem;
}

.current-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 14px;
  margin-top: 12px;
  color: #475569;
  font-size: 0.9rem;
}

.loading-card {
  margin-top: 120px;
}

.api-error {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 11px 14px;
  border-radius: 10px;
  background: #fffbeb;
  color: #92400e;
}

.hourly-table {
  overflow-x: auto;
}

.air-quality {
  display: grid;
  gap: 12px;
}

.air-quality div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.back-button {
  width: 100%;
}

.not-found-card {
  max-width: 520px;
  margin: 120px auto 0;
  text-align: center;
}

@media (max-width: 720px) {
  .detail-scene {
    padding: 18px 12px;
    border-radius: 16px;
  }
}
</style>
