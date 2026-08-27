// 도시 이름 검색보다 위치가 어긋날 가능성이 적도록 고정 좌표로 API를 요청한다.
export const weatherCities = [
  { id: 'city_01', name: '서울', latitude: 37.5665, longitude: 126.978 },
  { id: 'city_02', name: '수원', latitude: 37.2636, longitude: 127.0286 },
  { id: 'city_03', name: '부산', latitude: 35.1796, longitude: 129.0756 },
  { id: 'city_04', name: '제주', latitude: 33.4996, longitude: 126.5312 },
  { id: 'city_05', name: '인천', latitude: 37.4563, longitude: 126.7052 },
  { id: 'city_06', name: '광주', latitude: 35.1595, longitude: 126.8526 },
]

export function findWeatherCity(cityId) {
  return weatherCities.find((city) => city.id === cityId)
}
