import axios from 'axios'

const forecastClient = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: 10000,
})

const airQualityClient = axios.create({
  baseURL: 'https://air-quality-api.open-meteo.com/v1',
  timeout: 10000,
})

const openWeatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000,
})

const openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()

export const hasOpenWeatherApiKey = Boolean(openWeatherApiKey && openWeatherApiKey !== 'your_openweather_api_key')

function getWeatherMeta(code) {
  if (code === 0) return { status: '맑음', theme: 'sunny' }
  if ([1, 2, 3, 45, 48].includes(code)) return { status: '흐림', theme: 'cloudy' }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { status: '비', theme: 'rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { status: '눈', theme: 'snow' }
  if (code >= 95) return { status: '뇌우', theme: 'storm' }
  return { status: '흐림', theme: 'cloudy' }
}

function getOpenWeatherMeta(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return { status: '뇌우', theme: 'storm' }
  if (weatherId >= 300 && weatherId < 600) return { status: '비', theme: 'rain' }
  if (weatherId >= 600 && weatherId < 700) return { status: '눈', theme: 'snow' }
  if (weatherId === 800) return { status: '맑음', theme: 'sunny' }
  return { status: '흐림', theme: 'cloudy' }
}

function roundValue(value, fallback = 0) {
  return Number.isFinite(value) ? Math.round(value) : fallback
}

function formatHourLabel(isoTime, firstDate) {
  const [date, time] = isoTime.split('T')
  const hour = time.slice(0, 5)
  return date === firstDate ? hour : `내일 ${hour}`
}

function makeAirQualityByTime(airData) {
  const result = new Map()
  const times = airData.hourly?.time ?? []

  times.forEach((time, index) => {
    result.set(time, {
      pm10: airData.hourly.pm10?.[index],
      pm25: airData.hourly.pm2_5?.[index],
    })
  })

  return result
}

function buildHourlyForecast(forecastData, airData) {
  const times = forecastData.hourly?.time ?? []
  const currentHour = forecastData.current?.time?.slice(0, 13)
  const startIndex = Math.max(
    0,
    times.findIndex((time) => time.startsWith(currentHour)),
  )
  const selectedTimes = times.slice(startIndex, startIndex + 12)
  const airByTime = makeAirQualityByTime(airData)
  const firstDate = selectedTimes[0]?.split('T')[0]

  return selectedTimes.map((dateTime, offset) => {
    const index = startIndex + offset
    const air = airByTime.get(dateTime) ?? airData.current ?? {}

    return {
      dateTime,
      time: formatHourLabel(dateTime, firstDate),
      temp: roundValue(forecastData.hourly.temperature_2m?.[index]),
      rainProbability: roundValue(forecastData.hourly.precipitation_probability?.[index]),
      humidity: roundValue(forecastData.hourly.relative_humidity_2m?.[index]),
      pm10: roundValue(air.pm10, 999),
      pm25: roundValue(air.pm25 ?? air.pm2_5, 999),
      status: getWeatherMeta(forecastData.hourly.weather_code?.[index]).status,
    }
  })
}

function getAlertStatus(currentStatus, hourlyForecast, windSpeed) {
  const statuses = hourlyForecast.map((hour) => hour.status)
  if (statuses.includes('뇌우')) return '뇌우'
  if (statuses.includes('눈')) return '눈'
  if (statuses.includes('비')) return windSpeed >= 17 ? '강풍' : '비'
  return currentStatus
}

async function fetchOpenWeatherCurrent(latitude, longitude) {
  if (!hasOpenWeatherApiKey) return null

  const [weatherResponse, airResponse] = await Promise.all([
    openWeatherClient.get('/weather', {
      params: { lat: latitude, lon: longitude, appid: openWeatherApiKey, units: 'metric', lang: 'kr' },
    }),
    openWeatherClient.get('/air_pollution', {
      params: { lat: latitude, lon: longitude, appid: openWeatherApiKey },
    }),
  ])

  const rawWeather = weatherResponse.data
  const components = airResponse.data.list?.[0]?.components ?? {}
  const meta = getOpenWeatherMeta(rawWeather.weather?.[0]?.id ?? 801)

  return {
    temp: roundValue(rawWeather.main?.temp),
    humidity: roundValue(rawWeather.main?.humidity),
    windSpeed: roundValue(rawWeather.wind?.speed),
    pm10: roundValue(components.pm10, 999),
    pm25: roundValue(components.pm2_5, 999),
    ...meta,
  }
}

export async function fetchWeatherByCoordinates({ id = 'current_location', name, latitude, longitude }) {
  // 서로 독립적인 예보와 대기질 요청은 Promise.all로 동시에 실행한다.
  const [forecastResponse, airResponse] = await Promise.all([
    forecastClient.get('/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code',
        timezone: 'auto',
        forecast_days: 2,
      },
    }),
    airQualityClient.get('/air-quality', {
      params: {
        latitude,
        longitude,
        current: 'pm10,pm2_5',
        hourly: 'pm10,pm2_5',
        timezone: 'auto',
        forecast_days: 2,
      },
    }),
  ])

  const forecastData = forecastResponse.data
  const airData = airResponse.data
  const hourlyForecast = buildHourlyForecast(forecastData, airData)
  const openMeteoMeta = getWeatherMeta(forecastData.current.weather_code)
  let openWeatherCurrent = null
  let openWeatherFailed = false

  if (hasOpenWeatherApiKey) {
    try {
      openWeatherCurrent = await fetchOpenWeatherCurrent(latitude, longitude)
    } catch {
      // OpenWeather 키가 잘못됐거나 일시적으로 실패해도 Open-Meteo 실제 데이터로 화면을 유지한다.
      openWeatherFailed = true
    }
  }

  const current = openWeatherCurrent ?? {
    temp: roundValue(forecastData.current.temperature_2m),
    humidity: roundValue(forecastData.current.relative_humidity_2m),
    windSpeed: roundValue(forecastData.current.wind_speed_10m),
    pm10: roundValue(airData.current?.pm10, 999),
    pm25: roundValue(airData.current?.pm2_5, 999),
    ...openMeteoMeta,
  }

  return {
    city: {
      id,
      name,
      latitude,
      longitude,
      ...current,
      alertStatus: getAlertStatus(current.status, hourlyForecast, current.windSpeed),
    },
    hourlyForecast,
    source: openWeatherCurrent ? 'OpenWeather · Open-Meteo' : 'Open-Meteo',
    openWeatherFailed,
    updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  }
}
