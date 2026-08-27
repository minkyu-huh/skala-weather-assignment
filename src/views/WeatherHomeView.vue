<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import LifeRecommendationCard from '@/components/exercise/LifeRecommendationCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherAlertBanner from '@/components/exercise/WeatherAlertBanner.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import WeatherScene from '@/components/exercise/weather-effects/WeatherScene.vue'
import { mockHourlyForecast, mockWeatherList } from '@/data/mockWeather'
import { weatherCities } from '@/data/weatherCities'
import { fetchWeatherByCoordinates, hasOpenWeatherApiKey } from '@/services/weatherApi'
import { useConfigStore } from '@/stores/configStore'
import { getLaundryRecommendation, getWalkRecommendation } from '@/utils/weatherRecommendations'

const router = useRouter()
const configStore = useConfigStore()
const weatherList = ref(mockWeatherList)
const hourlyForecastByCity = ref({ ...mockHourlyForecast })
const searchQuery = ref('')
const selectedWeather = ref(weatherList.value[0])
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const searchStatusMessage = ref('전체 6개 도시를 표시하고 있습니다.')
const isLoading = ref(false)
const apiError = ref('')
const apiSource = ref('Mock 데이터')
const updatedAt = ref('')

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(query))
})

const selectedHourlyForecast = computed(() => {
  return hourlyForecastByCity.value[selectedWeather.value.id] ?? []
})

const walkRecommendation = computed(() => getWalkRecommendation(selectedHourlyForecast.value))
const laundryRecommendation = computed(() => getLaundryRecommendation(selectedHourlyForecast.value))
const weatherSceneClass = computed(() => `scene-${selectedWeather.value.theme}`)
const selectedDisplayTemp = computed(() => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((selectedWeather.value.temp * 9) / 5 + 32)
  }
  return selectedWeather.value.temp
})

// Composition 단계에서 만든 개인 기능을 Router 적용 뒤에도 유지한다.
watch(selectedWeather, (newCity, oldCity) => {
  if (newCity.id === oldCity.id) return
  selectedCityInfo.value = `${oldCity.name}에서 ${newCity.name}(으)로 변경했습니다. 날씨 장면과 생활 추천을 다시 계산했습니다.`
})

watchEffect(() => {
  const query = searchQuery.value.trim()
  const resultCount = filteredWeatherList.value.length

  if (!query) {
    searchStatusMessage.value = `전체 ${resultCount}개 도시를 표시하고 있습니다.`
  } else if (resultCount === 0) {
    searchStatusMessage.value = `'${query}' 검색 결과가 없습니다.`
  } else {
    searchStatusMessage.value = `'${query}' 검색 결과 ${resultCount}개를 찾았습니다.`
  }
})

const selectCity = (city) => {
  selectedWeather.value = city
}

// 상세보기 이벤트에서 도시 ID를 동적 Route의 params로 전달한다.
const goToDetail = (city) => {
  router.push({ name: 'WeatherDetail', params: { cityId: city.id } })
}

// 여섯 도시 요청을 동시에 처리하고, 일부 도시만 실패하면 해당 도시의 Mock 데이터만 유지한다.
const loadWeatherData = async () => {
  isLoading.value = true
  apiError.value = ''

  try {
    const results = await Promise.allSettled(weatherCities.map((city) => fetchWeatherByCoordinates(city)))
    const successfulBundles = results.filter((result) => result.status === 'fulfilled').map((result) => result.value)

    if (successfulBundles.length === 0) {
      throw new Error('모든 도시의 날씨 요청이 실패했습니다.')
    }

    const bundleById = new Map(successfulBundles.map((bundle) => [bundle.city.id, bundle]))
    weatherList.value = weatherCities.map((definition) => {
      return bundleById.get(definition.id)?.city ?? mockWeatherList.find((city) => city.id === definition.id)
    })
    hourlyForecastByCity.value = weatherCities.reduce((result, definition) => {
      result[definition.id] = bundleById.get(definition.id)?.hourlyForecast ?? mockHourlyForecast[definition.id]
      return result
    }, {})

    selectedWeather.value = weatherList.value.find((city) => city.id === selectedWeather.value.id) ?? weatherList.value[0]
    apiSource.value = [...new Set(successfulBundles.map((bundle) => bundle.source))].join(', ')
    updatedAt.value = successfulBundles[0].updatedAt

    const failedCount = results.length - successfulBundles.length
    const openWeatherFailed = successfulBundles.some((bundle) => bundle.openWeatherFailed)
    if (failedCount > 0) {
      apiError.value = `${failedCount}개 도시는 요청에 실패해 Mock 데이터를 표시합니다.`
    } else if (openWeatherFailed) {
      apiError.value = 'OpenWeather 요청이 실패해 Open-Meteo 데이터로 표시합니다. API 키를 확인해 주세요.'
    }
  } catch {
    apiError.value = '실제 날씨를 불러오지 못해 Mock 데이터를 표시합니다. 네트워크 상태를 확인해 주세요.'
    apiSource.value = 'Mock 데이터'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadWeatherData)
</script>

<template>
  <div class="weather-dashboard" :class="weatherSceneClass">
    <WeatherScene :theme="selectedWeather.theme" />

    <div class="dashboard-wrapper content-layer">
      <div class="current-scene-label">
        {{ selectedWeather.name }} · {{ selectedWeather.status }} · {{ selectedDisplayTemp }}{{ configStore.unitSymbol }}
      </div>

      <div class="component-stack">
        <WeatherAlertBanner :status="selectedWeather.alertStatus ?? selectedWeather.status" />

        <div class="api-state" aria-live="polite">
          <el-skeleton v-if="isLoading" :rows="2" animated />
          <template v-else>
            <div class="source-line">
              <el-tag type="success" effect="plain">{{ apiSource }}</el-tag>
              <span v-if="updatedAt">{{ updatedAt }} 갱신</span>
              <el-button v-if="apiError" type="warning" plain size="small" @click="loadWeatherData">다시 불러오기</el-button>
            </div>
            <el-alert v-if="apiError" :title="apiError" type="warning" show-icon :closable="false" />
            <el-alert
              v-else-if="!hasOpenWeatherApiKey"
              title="OpenWeather 키 미설정 · 현재는 Open-Meteo 실제 데이터를 사용합니다."
              type="info"
              show-icon
              :closable="false"
            />
          </template>
        </div>

        <BaseDashboardCard>
          <SearchBar
            :current-query="searchQuery"
            :result-message="searchStatusMessage"
            @update-query="(value) => (searchQuery = value)"
          />
        </BaseDashboardCard>

        <BaseDashboardCard>
          <h3>지역별 날씨 현황</h3>
          <WeatherCard
            v-for="item in filteredWeatherList"
            :key="item.id"
            :city-item="item"
            @select-card="selectCity"
            @click-detail="goToDetail"
          />
          <el-empty v-if="filteredWeatherList.length === 0" description="검색 결과와 일치하는 도시가 없습니다." :image-size="72" />
        </BaseDashboardCard>

        <LifeRecommendationCard
          :city-name="selectedWeather.name"
          :walk-recommendation="walkRecommendation"
          :laundry-recommendation="laundryRecommendation"
        />

        <div class="status-bar">{{ selectedCityInfo }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-dashboard {
  position: relative;
  min-height: 720px;
  padding: 36px 20px;
  overflow: hidden;
  border-radius: 24px;
  transition: background 0.8s ease;
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

.content-layer {
  position: relative;
  z-index: 1;
}

.current-scene-label {
  width: fit-content;
  margin: 0 auto 16px;
  padding: 9px 16px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.44);
  color: #fff;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.component-stack {
  display: grid;
  gap: 15px;
}

.api-state {
  padding: 11px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.88);
  color: #334155;
}

.source-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  margin-bottom: 10px;
}

.empty-result {
  padding: 18px;
  color: #b91c1c;
  text-align: center;
}

@media (max-width: 720px) {
  .weather-dashboard {
    min-height: 680px;
    padding: 24px 12px;
    border-radius: 16px;
  }

  .dashboard-wrapper {
    width: 100%;
  }
}
</style>
