<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import LifeRecommendationCard from '@/components/exercise/LifeRecommendationCard.vue'
import WeatherAlertBanner from '@/components/exercise/WeatherAlertBanner.vue'
import WeatherScene from '@/components/exercise/weather-effects/WeatherScene.vue'
import { fetchWeatherByCoordinates } from '@/services/weatherApi'
import { useConfigStore } from '@/stores/configStore'
import { useLocationStore } from '@/stores/locationStore'
import { getLaundryRecommendation, getWalkRecommendation } from '@/utils/weatherRecommendations'

const locationStore = useLocationStore()
const configStore = useConfigStore()
const { latitude, longitude, status, errorMessage, hasLocation } = storeToRefs(locationStore)
const weatherBundle = ref(null)
const isWeatherLoading = ref(false)
const weatherError = ref('')

const currentWeather = computed(() => weatherBundle.value?.city)
const hourlyForecast = computed(() => weatherBundle.value?.hourlyForecast ?? [])
const sceneClass = computed(() => (currentWeather.value ? `scene-${currentWeather.value.theme}` : 'scene-cloudy'))
const walkRecommendation = computed(() => getWalkRecommendation(hourlyForecast.value))
const laundryRecommendation = computed(() => getLaundryRecommendation(hourlyForecast.value))

const locationMessage = computed(() => {
  if (status.value === 'loading') return '현재 위치를 확인하고 있습니다.'
  if (status.value === 'error') return errorMessage.value
  if (isWeatherLoading.value) return '현재 위치의 실제 날씨를 불러오고 있습니다.'
  if (status.value === 'success') return '위치를 확인했습니다. 아래에서 실제 날씨를 확인할 수 있습니다.'
  return '버튼을 누르면 브라우저에서 위치 권한을 요청합니다.'
})

const formatTemperature = (celsius) => {
  const value = configStore.unit === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : celsius
  return `${value}${configStore.unitSymbol}`
}

const loadCurrentLocationWeather = async () => {
  if (!hasLocation.value) return

  isWeatherLoading.value = true
  weatherError.value = ''
  try {
    weatherBundle.value = await fetchWeatherByCoordinates({
      name: '현재 위치',
      latitude: latitude.value,
      longitude: longitude.value,
    })
    if (weatherBundle.value.openWeatherFailed) {
      weatherError.value = 'OpenWeather 요청이 실패해 Open-Meteo 실제 데이터로 표시합니다.'
    }
  } catch {
    weatherError.value = '현재 위치의 날씨를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    isWeatherLoading.value = false
  }
}

const handleLocationRequest = async () => {
  const success = await locationStore.requestCurrentLocation()
  if (success) await loadCurrentLocationWeather()
}

const clearLocation = () => {
  locationStore.clearLocation()
  weatherBundle.value = null
  weatherError.value = ''
}

onMounted(() => {
  if (hasLocation.value) loadCurrentLocationWeather()
})
</script>

<template>
  <section class="location-view" :class="sceneClass">
    <WeatherScene v-if="currentWeather" :theme="currentWeather.theme" />

    <div class="location-content">
      <p class="eyebrow">개인 추가 View</p>
      <h2>현재 위치 날씨</h2>
      <p>{{ locationMessage }}</p>

      <el-button type="primary" size="large" :loading="status === 'loading' || isWeatherLoading" @click="handleLocationRequest">
        {{ status === 'loading' || isWeatherLoading ? '날씨 확인 중...' : '현재 위치 날씨 확인하기' }}
      </el-button>

      <el-card v-if="hasLocation" class="coordinate-card" shadow="never">
        <span>위도 {{ latitude }}</span>
        <span>경도 {{ longitude }}</span>
        <el-button type="info" plain size="small" @click="clearLocation">위치 지우기</el-button>
      </el-card>

      <div v-if="weatherError" class="weather-error">
        <el-alert :title="weatherError" type="warning" show-icon :closable="false" />
        <el-button v-if="hasLocation" type="warning" plain @click="loadCurrentLocationWeather">다시 불러오기</el-button>
      </div>

      <template v-if="currentWeather && !isWeatherLoading">
        <WeatherAlertBanner :status="currentWeather.alertStatus ?? currentWeather.status" />

        <el-card class="current-card" shadow="never">
          <p>{{ weatherBundle.source }} · {{ weatherBundle.updatedAt }} 갱신</p>
          <h3>{{ currentWeather.name }} · {{ currentWeather.status }}</h3>
          <strong>{{ formatTemperature(currentWeather.temp) }}</strong>
          <div>
            <span>습도 {{ currentWeather.humidity }}%</span>
            <span>풍속 {{ currentWeather.windSpeed }}m/s</span>
            <span>미세먼지 {{ currentWeather.pm10 }}㎍/㎥</span>
            <span>초미세먼지 {{ currentWeather.pm25 }}㎍/㎥</span>
          </div>
        </el-card>

        <el-card class="location-hourly" shadow="never">
          <h3>앞으로 6시간</h3>
          <div class="hourly-list">
            <article v-for="hour in hourlyForecast.slice(0, 6)" :key="hour.dateTime">
              <strong>{{ hour.time }}</strong>
              <span>{{ hour.status }}</span>
              <span>{{ formatTemperature(hour.temp) }}</span>
              <span>강우 {{ hour.rainProbability }}%</span>
            </article>
          </div>
        </el-card>

        <LifeRecommendationCard
          :city-name="currentWeather.name"
          :walk-recommendation="walkRecommendation"
          :laundry-recommendation="laundryRecommendation"
        />
      </template>
    </div>
  </section>
</template>

<style scoped>
.location-view {
  position: relative;
  max-width: 640px;
  min-height: 360px;
  margin: 0 auto;
  padding: 48px;
  overflow: hidden;
  border-radius: 24px;
  background: linear-gradient(145deg, #dbeafe, #f0f9ff);
  text-align: center;
  isolation: isolate;
}

.scene-sunny {
  background: linear-gradient(160deg, #60a5fa, #fef3c7);
}

.scene-cloudy {
  background: linear-gradient(160deg, #94a3b8, #e2e8f0);
}

.scene-rain {
  background: linear-gradient(160deg, #1e3a5f, #8da5b9);
}

.scene-snow {
  background: linear-gradient(160deg, #93c5fd, #f8fafc);
}

.scene-storm {
  background: linear-gradient(160deg, #111827, #5f6b7c);
}

.location-content {
  position: relative;
  z-index: 1;
}

.eyebrow {
  color: #2563eb;
  font-weight: 700;
}

.location-content > .el-button {
  margin-top: 18px;
}

.coordinate-card {
  margin-top: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.75);
}

.coordinate-card :deep(.el-card__body) {
  display: flex;
  justify-content: center;
  gap: 20px;
  align-items: center;
  padding: 16px;
}

.weather-error,
.current-card,
.location-hourly {
  margin-top: 18px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.88);
}

.weather-error {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #92400e;
}

.weather-error .el-alert {
  flex: 1;
}

.current-card :deep(.el-card__body > p) {
  margin-top: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.current-card :deep(.el-card__body),
.location-hourly :deep(.el-card__body) {
  padding: 16px;
}

.current-card :deep(.el-card__body > strong) {
  display: block;
  margin: 8px;
  font-size: 2rem;
}

.current-card :deep(.el-card__body > div) {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 14px;
}

.hourly-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.hourly-list article {
  display: grid;
  gap: 4px;
  padding: 10px 5px;
  border-radius: 8px;
  background: rgba(219, 234, 254, 0.7);
  font-size: 0.85rem;
}

.location-view :deep(.weather-alert),
.location-view :deep(.recommendation-card) {
  margin-top: 18px;
  text-align: left;
}

@media (max-width: 560px) {
  .location-view {
    padding: 30px 18px;
  }

  .coordinate-card {
    width: 100%;
  }

  .coordinate-card :deep(.el-card__body) {
    flex-direction: column;
    gap: 6px;
  }

  .hourly-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
