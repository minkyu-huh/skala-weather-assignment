<script setup>
defineProps({
  theme: {
    type: String,
    required: true,
  },
})

// 입자마다 위치와 속도를 다르게 주어 비와 눈이 한 줄로 떨어지지 않게 한다.
const particles = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${-((index * 0.23) % 3)}s`,
  duration: `${1.6 + (index % 5) * 0.22}s`,
  size: `${10 + (index % 4) * 3}px`,
}))
</script>

<template>
  <div class="weather-effects" :class="`effect-${theme}`" aria-hidden="true">
    <div v-if="theme === 'sunny'" class="sun"></div>

    <template v-if="theme === 'cloudy' || theme === 'storm'">
      <div class="cloud cloud-one"></div>
      <div class="cloud cloud-two"></div>
      <div class="cloud cloud-three"></div>
    </template>

    <template v-if="theme === 'rain' || theme === 'storm'">
      <span
        v-for="particle in particles"
        :key="`rain-${particle.id}`"
        class="rain-drop"
        :style="{ left: particle.left, animationDelay: particle.delay }"
      ></span>
    </template>

    <template v-if="theme === 'snow'">
      <span
        v-for="particle in particles"
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

    <div v-if="theme === 'storm'" class="lightning"></div>
  </div>
</template>

<style scoped>
.weather-effects {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
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

.effect-cloudy .cloud {
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
