<script setup>
import { ref } from 'vue'

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

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const selectedWeather = ref(weatherList.value[0])

// input 이벤트에서 받은 값을 반응형 검색어에 저장한다.
// 1단계에서는 입력 이벤트와 데이터 연결을 확인하고, 실제 목록 필터링은 2단계 computed에서 확장한다.
const updateSearchQuery = (event) => {
  searchQuery.value = event.target.value
}

// 카드 선택 문구와 날씨 장면이 같은 도시를 바라보도록 한 함수에서 변경한다.
// 클릭 이벤트에 도시 객체를 전달하면 선택 도시의 theme도 함께 바뀐다.
const selectCity = (city) => {
  selectedWeather.value = city
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
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
  <div class="weather-dashboard" :class="`scene-${selectedWeather.theme}`">
    <div class="weather-effects" aria-hidden="true">
      <!-- 개인 기능: 선택한 날씨에 필요한 효과만 v-if로 조건부 렌더링한다. -->
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
        <input type="text" :value="searchQuery" @input="updateSearchQuery" placeholder="검색할 도시 이름 입력" />
        <p>
          검색 중인 도시: <strong>{{ searchQuery }}</strong>
        </p>
      </section>

      <section class="list-box">
        <h3>🏙️ 지역별 날씨 현황</h3>

        <!-- 도시 배열을 늘려도 같은 카드를 만들 수 있도록 v-for를 사용한다. -->
        <div v-for="item in weatherList" :key="item.id" class="weather-card" @click="selectCity(item)">
          <h4>{{ item.name }} ({{ item.status }})</h4>
          <p>현재 기온: {{ item.temp }}°C</p>

          <span v-if="item.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
          <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>

          <button class="btn-detail" @click.stop="showDetail(item.name, item.status)">상세보기</button>
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
.weather-card,
.status-bar {
  backdrop-filter: blur(12px);
}

.search-box,
.list-box {
  background: rgba(248, 250, 252, 0.84);
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
