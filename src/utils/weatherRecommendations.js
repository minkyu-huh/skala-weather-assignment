export function getWalkRecommendation(hourlyForecast) {
  const candidates = hourlyForecast
    .filter((hour) => hour.rainProbability <= 30 && hour.pm10 <= 80 && hour.pm25 <= 35 && hour.temp >= 8 && hour.temp <= 28)
    .sort((first, second) => Math.abs(first.temp - 22) - Math.abs(second.temp - 22))

  if (candidates.length === 0) {
    return '오늘은 날씨 조건이 좋지 않아 산책을 권장하지 않습니다.'
  }

  const bestTime = candidates[0]
  return `${bestTime.time} 추천 · 강우 ${bestTime.rainProbability}% · 미세먼지 ${bestTime.pm10}㎍/㎥`
}

export function getLaundryRecommendation(hourlyForecast) {
  const candidates = hourlyForecast
    .filter((hour) => hour.rainProbability <= 20 && hour.humidity <= 65 && !['비', '눈', '태풍'].includes(hour.status))
    .sort((first, second) => first.humidity - second.humidity)

  if (candidates.length === 0) {
    return '오늘은 비 또는 높은 습도 때문에 야외 건조를 권장하지 않습니다.'
  }

  const bestTime = candidates[0]
  return `${bestTime.time} 추천 · 강우 ${bestTime.rainProbability}% · 습도 ${bestTime.humidity}%`
}
