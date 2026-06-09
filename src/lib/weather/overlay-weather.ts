import type { WeatherData, WeatherOverlayPoint } from "@/types/weather-data";

const DEFAULT_PRESSURE_HPA = 1013;
const DEFAULT_VISIBILITY_KM = 12;

function getFallbackFeelsLike(point: WeatherOverlayPoint) {
  return point.feelsLike ?? point.temperature;
}

function getFallbackHumidity(point: WeatherOverlayPoint) {
  return point.humidity ?? 58;
}

function getFallbackWindSpeed(point: WeatherOverlayPoint) {
  return point.windSpeed ?? 3.3;
}

export function getWeatherFromOverlayPoint(point: WeatherOverlayPoint): WeatherData {
  const sourceLabel = point.updatedAt === "Mock now" ? "Mock overlay" : "Open-Meteo current";

  return {
    countryCode: point.countryCode,
    countryName: point.countryName,
    regionCode: point.id,
    regionName: point.label,
    temperature: point.temperature,
    feelsLike: getFallbackFeelsLike(point),
    humidity: getFallbackHumidity(point),
    windSpeed: getFallbackWindSpeed(point),
    pressureHpa: DEFAULT_PRESSURE_HPA,
    visibilityKm: DEFAULT_VISIBILITY_KM,
    condition: point.condition,
    description:
      point.description ??
      `${point.label}의 실시간 날씨를 오버레이 데이터에서 정리했습니다.`,
    updatedAt: point.updatedAt,
    sourceLabel,
  };
}
