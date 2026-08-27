<script setup>
import { computed, ref, watch, watchEffect } from 'vue'

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

// 선택 도시 하나를 명시적으로 감시해 장면과 추천이 바뀌었다는 안내를 화면에 남긴다.
watch(selectedWeather, (newCity, oldCity) => {
  selectedCityInfo.value = `${oldCity.name}에서 ${newCity.name}(으)로 변경했습니다. 날씨 장면과 생활 추천을 다시 계산했습니다.`
})

// 검색어와 검색 결과를 함께 사용하는 부수 효과이므로 watchEffect로 안내 문구를 갱신한다.
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

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

// 비와 눈 입자의 위치와 속도를 조금씩 다르게 만들기 위한 화면용 데이터이다.
const effectParticles = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${-((index * 0.23) % 3)}s`,
  duration: `${1.6 + (index % 5) * 0.22}s`,
  size: `${10 + (index % 4) * 3}px`,
}))
</script>

<template>
  <div class="weather-dashboard" :class="weatherSceneClass">
    <div class="weather-effects" aria-hidden="true">
      <div v-if="selectedWeather.theme === 'sunny'" class="sun"></div>

      <template v-if="selectedWeather.theme === 'cloudy' || selectedWeather.theme === 'storm'">
        <div class="cloud cloud-one"></div>
        <div class="cloud cloud-two"></div>
        <div class="cloud cloud-three"></div>
      </template>

      <template v-if="selectedWeather.theme === 'rain' || selectedWeather.theme === 'storm'">
        <span
          v-for="particle in effectParticles"
          :key="`rain-${particle.id}`"
          class="rain-drop"
          :style="{ left: particle.left, animationDelay: particle.delay }"
        ></span>
      </template>

      <template v-if="selectedWeather.theme === 'snow'">
        <span
          v-for="particle in effectParticles"
          :key="`snow-${particle.id}`"
          class="snowflake"
          :style="{
            left: particle.left,
            fontSize: particle.size,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }"
          >❄</span
        >
      </template>

      <div v-if="selectedWeather.theme === 'storm'" class="lightning"></div>
    </div>

    <div class="dashboard-wrapper content-layer">
      <div class="current-scene-label">
        {{ selectedWeather.name }} · {{ selectedWeather.status }} · {{ selectedWeather.temp }}°C
      </div>

      <section class="search-box">
        <h3>🔍 도시 검색</h3>
        <input type="text" :value="searchQuery" @input="(event) => (searchQuery = event.target.value)" placeholder="검색할 도시 이름 입력" />
        <p>
          검색 중인 도시: <strong>{{ searchQuery }}</strong>
        </p>
        <p class="search-status" aria-live="polite">{{ searchStatusMessage }}</p>
      </section>

      <section class="list-box">
        <h3>🏙️ 지역별 날씨 현황</h3>

        <div v-for="item in filteredWeatherList" :key="item.id" class="weather-card" @click="selectCity(item)">
          <h4>{{ item.name }} ({{ item.status }})</h4>
          <p>현재 기온: {{ item.temp }}°C</p>

          <span v-if="item.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
          <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>

          <button class="btn-detail" @click.stop="showDetail(item.name, item.status)">상세보기</button>
        </div>

        <p v-if="filteredWeatherList.length === 0" class="empty-result">검색 결과와 일치하는 도시가 없습니다.</p>
      </section>

      <section class="recommendation-box">
        <h3>생활 추천 · {{ selectedWeather.name }}</h3>
        <div class="recommendation-item">
          <strong>산책</strong>
          <span>{{ walkRecommendation }}</span>
        </div>
        <div class="recommendation-item">
          <strong>빨래</strong>
          <span>{{ laundryRecommendation }}</span>
        </div>
      </section>

      <div class="status-bar">
        {{ selectedCityInfo }}
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

.weather-effects {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.sun {
  position: absolute;
  top: 38px;
  right: 70px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #fde047;
  box-shadow:
    0 0 45px rgba(253, 224, 71, 0.9),
    0 0 110px rgba(255, 247, 170, 0.75);
  animation: sunlight 3.5s ease-in-out infinite alternate;
}

.sun::after {
  content: '';
  position: absolute;
  inset: -55px;
  border-radius: 50%;
  background: repeating-conic-gradient(rgba(255, 255, 255, 0.32) 0deg 5deg, transparent 5deg 18deg);
  animation: sun-rays 18s linear infinite;
}

.cloud {
  position: absolute;
  width: 180px;
  height: 58px;
  border-radius: 999px;
  background: rgba(55, 65, 81, 0.86);
  box-shadow:
    38px -26px 0 5px rgba(55, 65, 81, 0.86),
    91px -13px 0 10px rgba(55, 65, 81, 0.86);
  animation: cloud-drift 16s linear infinite;
}

.scene-cloudy .cloud {
  background: rgba(226, 232, 240, 0.9);
  box-shadow:
    38px -26px 0 5px rgba(226, 232, 240, 0.9),
    91px -13px 0 10px rgba(226, 232, 240, 0.9);
}

.cloud-one {
  top: 100px;
  left: -230px;
}

.cloud-two {
  top: 235px;
  left: -330px;
  transform: scale(0.75);
  animation-delay: -7s;
}

.cloud-three {
  top: 48px;
  left: -430px;
  transform: scale(0.58);
  animation-delay: -12s;
}

.rain-drop {
  position: absolute;
  top: -35px;
  width: 2px;
  height: 25px;
  border-radius: 999px;
  background: rgba(219, 234, 254, 0.75);
  transform: rotate(12deg);
  animation: rain-fall 1.1s linear infinite;
}

.snowflake {
  position: absolute;
  top: -30px;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
  animation: snow-fall 3s linear infinite;
}

.lightning {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.65);
  opacity: 0;
  animation: lightning-flash 6s ease-in-out infinite;
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

.search-box,
.list-box,
.recommendation-box,
.weather-card,
.status-bar {
  backdrop-filter: blur(12px);
}

.search-box,
.list-box,
.recommendation-box {
  background: rgba(248, 250, 252, 0.84);
}

.recommendation-box {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
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

.empty-result {
  padding: 18px;
  color: #b91c1c;
  text-align: center;
}

.weather-card {
  background: rgba(255, 255, 255, 0.9);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.weather-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.13);
}

@keyframes sunlight {
  from {
    transform: scale(0.96);
    filter: brightness(0.96);
  }
  to {
    transform: scale(1.05);
    filter: brightness(1.08);
  }
}

@keyframes sun-rays {
  to {
    transform: rotate(360deg);
  }
}

@keyframes cloud-drift {
  from {
    translate: 0 0;
  }
  to {
    translate: 1250px 0;
  }
}

@keyframes rain-fall {
  to {
    translate: -45px 820px;
  }
}

@keyframes snow-fall {
  0% {
    translate: 0 0;
    rotate: 0deg;
  }
  50% {
    translate: 30px 390px;
  }
  100% {
    translate: -18px 820px;
    rotate: 280deg;
  }
}

@keyframes lightning-flash {
  0%,
  87%,
  91%,
  100% {
    opacity: 0;
  }
  88%,
  90% {
    opacity: 0.85;
  }
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

  .sun {
    right: 24px;
    width: 90px;
    height: 90px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sun,
  .sun::after,
  .cloud,
  .rain-drop,
  .snowflake,
  .lightning {
    animation: none;
  }
}
</style>
