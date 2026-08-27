<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import LifeRecommendationCard from './LifeRecommendationCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherAlertBanner from './WeatherAlertBanner.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherScene from './weather-effects/WeatherScene.vue'

// API를 연결하기 전 화면과 이벤트를 확인하기 위한 Mock 데이터이다.
// theme 값은 선택한 도시의 배경 효과를 바꾸는 데 사용한다.
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', theme: 'sunny' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', theme: 'rain' },
  { id: 'city_03', name: '부산', temp: 26, status: '흐림', theme: 'cloudy' },
  { id: 'city_04', name: '제주', temp: 23, status: '태풍', theme: 'storm' },
  { id: 'city_05', name: '인천', temp: 1, status: '눈', theme: 'snow' },
  { id: 'city_06', name: '광주', temp: 27, status: '맑음', theme: 'sunny' },
])

// 실제 API를 붙이기 전 추천 계산을 연습하기 위한 시간별 예보 데이터이다.
const mockHourlyForecast = ref({
  city_01: [
    { time: '09:00', temp: 22, rainProbability: 10, humidity: 55, pm10: 32, pm25: 16, status: '맑음' },
    { time: '12:00', temp: 27, rainProbability: 10, humidity: 48, pm10: 38, pm25: 19, status: '맑음' },
    { time: '15:00', temp: 28, rainProbability: 20, humidity: 50, pm10: 42, pm25: 22, status: '구름' },
    { time: '18:00', temp: 24, rainProbability: 10, humidity: 58, pm10: 30, pm25: 14, status: '맑음' },
  ],
  city_02: [
    { time: '09:00', temp: 21, rainProbability: 70, humidity: 82, pm10: 25, pm25: 13, status: '비' },
    { time: '12:00', temp: 23, rainProbability: 60, humidity: 78, pm10: 22, pm25: 11, status: '비' },
    { time: '15:00', temp: 24, rainProbability: 40, humidity: 72, pm10: 28, pm25: 14, status: '흐림' },
    { time: '18:00', temp: 22, rainProbability: 20, humidity: 64, pm10: 31, pm25: 16, status: '흐림' },
  ],
  city_03: [
    { time: '09:00', temp: 23, rainProbability: 20, humidity: 66, pm10: 40, pm25: 20, status: '흐림' },
    { time: '12:00', temp: 25, rainProbability: 20, humidity: 61, pm10: 45, pm25: 23, status: '흐림' },
    { time: '15:00', temp: 26, rainProbability: 10, humidity: 58, pm10: 48, pm25: 25, status: '구름' },
    { time: '18:00', temp: 23, rainProbability: 10, humidity: 63, pm10: 36, pm25: 18, status: '구름' },
  ],
  city_04: [
    { time: '09:00', temp: 22, rainProbability: 80, humidity: 88, pm10: 20, pm25: 9, status: '태풍' },
    { time: '12:00', temp: 23, rainProbability: 90, humidity: 91, pm10: 18, pm25: 8, status: '태풍' },
    { time: '15:00', temp: 23, rainProbability: 90, humidity: 92, pm10: 17, pm25: 8, status: '태풍' },
    { time: '18:00', temp: 22, rainProbability: 80, humidity: 89, pm10: 19, pm25: 9, status: '비' },
  ],
  city_05: [
    { time: '09:00', temp: -1, rainProbability: 70, humidity: 78, pm10: 24, pm25: 12, status: '눈' },
    { time: '12:00', temp: 1, rainProbability: 60, humidity: 74, pm10: 26, pm25: 13, status: '눈' },
    { time: '15:00', temp: 2, rainProbability: 40, humidity: 70, pm10: 30, pm25: 15, status: '흐림' },
    { time: '18:00', temp: 0, rainProbability: 50, humidity: 75, pm10: 28, pm25: 14, status: '눈' },
  ],
  city_06: [
    { time: '09:00', temp: 21, rainProbability: 10, humidity: 57, pm10: 55, pm25: 29, status: '맑음' },
    { time: '12:00', temp: 26, rainProbability: 0, humidity: 45, pm10: 58, pm25: 30, status: '맑음' },
    { time: '15:00', temp: 27, rainProbability: 10, humidity: 47, pm10: 62, pm25: 32, status: '맑음' },
    { time: '18:00', temp: 23, rainProbability: 10, humidity: 54, pm10: 49, pm25: 25, status: '맑음' },
  ],
})

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const selectedWeather = ref(weatherList.value[0])
const searchStatusMessage = ref('전체 6개 도시를 표시하고 있습니다.')

// 검색어가 없으면 전체 목록을, 검색어가 있으면 일치하는 도시만 반환한다.
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(query))
})

const weatherSceneClass = computed(() => `scene-${selectedWeather.value.theme}`)

const selectedHourlyForecast = computed(() => {
  return mockHourlyForecast.value[selectedWeather.value.id] ?? []
})

// 비와 대기질 기준을 모두 통과한 시간 중 기온이 22도에 가까운 시간을 선택한다.
const walkRecommendation = computed(() => {
  const candidates = selectedHourlyForecast.value
    .filter((hour) => hour.rainProbability <= 30 && hour.pm10 <= 80 && hour.pm25 <= 35 && hour.temp >= 8 && hour.temp <= 28)
    .sort((first, second) => Math.abs(first.temp - 22) - Math.abs(second.temp - 22))

  if (candidates.length === 0) {
    return '오늘은 날씨 조건이 좋지 않아 산책을 권장하지 않습니다.'
  }

  const bestTime = candidates[0]
  return `${bestTime.time} 추천 · 강우 ${bestTime.rainProbability}% · 미세먼지 ${bestTime.pm10}㎍/㎥`
})

// 비가 오지 않고 습도가 낮은 시간을 우선해 야외 건조 시간을 정한다.
const laundryRecommendation = computed(() => {
  const candidates = selectedHourlyForecast.value
    .filter((hour) => hour.rainProbability <= 20 && hour.humidity <= 65 && !['비', '눈', '태풍'].includes(hour.status))
    .sort((first, second) => first.humidity - second.humidity)

  if (candidates.length === 0) {
    return '오늘은 비 또는 높은 습도 때문에 야외 건조를 권장하지 않습니다.'
  }

  const bestTime = candidates[0]
  return `${bestTime.time} 추천 · 강우 ${bestTime.rainProbability}% · 습도 ${bestTime.humidity}%`
})

watch(selectedWeather, (newCity, oldCity) => {
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

// 카드 선택 문구와 날씨 장면이 같은 도시를 바라보도록 한 함수에서 변경한다.
const selectCity = (city) => {
  selectedWeather.value = city
}

const showDetail = (city) => {
  window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}
</script>

<template>
  <div class="weather-dashboard" :class="weatherSceneClass">
    <WeatherScene :theme="selectedWeather.theme" />

    <div class="dashboard-wrapper content-layer">
      <div class="current-scene-label">
        {{ selectedWeather.name }} · {{ selectedWeather.status }} · {{ selectedWeather.temp }}°C
      </div>

      <div class="component-stack">
        <WeatherAlertBanner :status="selectedWeather.status" />

        <BaseDashboardCard>
          <SearchBar
            :current-query="searchQuery"
            :result-message="searchStatusMessage"
            @update-query="(value) => (searchQuery = value)"
          />
        </BaseDashboardCard>

        <BaseDashboardCard>
          <h3>🏙️ 지역별 날씨 현황</h3>
          <WeatherCard
            v-for="item in filteredWeatherList"
            :key="item.id"
            :city-item="item"
            @select-card="selectCity"
            @click-detail="showDetail"
          />
          <p v-if="filteredWeatherList.length === 0" class="empty-result">검색 결과와 일치하는 도시가 없습니다.</p>
        </BaseDashboardCard>

        <LifeRecommendationCard
          :city-name="selectedWeather.name"
          :walk-recommendation="walkRecommendation"
          :laundry-recommendation="laundryRecommendation"
        />

        <div class="status-bar">
          {{ selectedCityInfo }}
        </div>
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
  color: #ffffff;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.component-stack {
  display: grid;
  gap: 15px;
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
