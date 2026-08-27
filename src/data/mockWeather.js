export const mockWeatherList = [
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', theme: 'sunny' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', theme: 'rain' },
  { id: 'city_03', name: '부산', temp: 26, status: '흐림', theme: 'cloudy' },
  { id: 'city_04', name: '제주', temp: 23, status: '태풍', theme: 'storm' },
  { id: 'city_05', name: '인천', temp: 1, status: '눈', theme: 'snow' },
  { id: 'city_06', name: '광주', temp: 27, status: '맑음', theme: 'sunny' },
]

export const mockHourlyForecast = {
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
}
