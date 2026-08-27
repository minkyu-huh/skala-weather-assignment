import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useLocationStore = defineStore('location', () => {
  // state: 위치 View를 벗어나도 권한 요청 결과와 좌표를 유지할 반응형 데이터이다.
  const latitude = ref(null)
  const longitude = ref(null)
  const status = ref('idle')
  const errorMessage = ref('')

  // getter: 두 좌표가 모두 있을 때만 조회 성공 화면을 보여주기 위해 계산한다.
  const hasLocation = computed(() => latitude.value !== null && longitude.value !== null)

  // action: 비동기 위치 요청 중 생기는 loading, success, error 상태를 한곳에서 변경한다.
  function requestCurrentLocation() {
    if (!navigator.geolocation) {
      status.value = 'error'
      errorMessage.value = '현재 브라우저에서는 위치 조회를 지원하지 않습니다.'
      return Promise.resolve(false)
    }

    status.value = 'loading'
    errorMessage.value = ''

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          latitude.value = Number(coords.latitude.toFixed(4))
          longitude.value = Number(coords.longitude.toFixed(4))
          status.value = 'success'
          resolve(true)
        },
        (error) => {
          const messageByCode = {
            1: '위치 권한이 거부되었습니다. 브라우저 설정을 확인해 주세요.',
            2: '현재 위치 정보를 확인할 수 없습니다.',
            3: '위치 확인 시간이 초과되었습니다.',
          }
          status.value = 'error'
          errorMessage.value = messageByCode[error.code] ?? '위치를 확인하는 중 문제가 발생했습니다.'
          resolve(false)
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      )
    })
  }

  function clearLocation() {
    latitude.value = null
    longitude.value = null
    status.value = 'idle'
    errorMessage.value = ''
  }

  return {
    latitude,
    longitude,
    status,
    errorMessage,
    hasLocation,
    requestCurrentLocation,
    clearLocation,
  }
})
