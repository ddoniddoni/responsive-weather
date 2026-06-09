import { WEATHER_OVERLAY_POINTS } from "@/constants/weather-overlay-points";
import type { WeatherCondition } from "@/types/weather";
import type { WeatherOverlayPoint } from "@/types/weather-data";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CURRENT_WEATHER_VARIABLES = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation",
  "wind_speed_10m",
  "weather_code",
];

type OpenMeteoCurrentWeather = {
  time?: string;
  temperature_2m?: number | null;
  relative_humidity_2m?: number | null;
  apparent_temperature?: number | null;
  precipitation?: number | null;
  wind_speed_10m?: number | null;
  weather_code?: number | null;
};

type OpenMeteoForecastResponse = {
  latitude: number;
  longitude: number;
  current?: OpenMeteoCurrentWeather;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function normalizeOpenMeteoWeatherCode(weatherCode: number | null | undefined): WeatherCondition {
  if (!isFiniteNumber(weatherCode)) {
    return "unknown";
  }

  if (weatherCode === 0 || weatherCode === 1) {
    return "sunny";
  }

  if (weatherCode === 2 || weatherCode === 3) {
    return "cloudy";
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return "foggy";
  }

  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    return "rainy";
  }

  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    weatherCode === 85 ||
    weatherCode === 86
  ) {
    return "snowy";
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    return "stormy";
  }

  return "unknown";
}

function buildOpenMeteoOverlayUrl(points: WeatherOverlayPoint[]) {
  const url = new URL(OPEN_METEO_FORECAST_URL);

  url.searchParams.set("latitude", points.map((point) => point.latitude).join(","));
  url.searchParams.set("longitude", points.map((point) => point.longitude).join(","));
  url.searchParams.set("current", CURRENT_WEATHER_VARIABLES.join(","));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("wind_speed_unit", "ms");

  return url;
}

function normalizeOpenMeteoOverlayPoint(
  basePoint: WeatherOverlayPoint,
  response: OpenMeteoForecastResponse | undefined,
): WeatherOverlayPoint {
  const current = response?.current;
  const temperature = isFiniteNumber(current?.temperature_2m)
    ? Math.round(current.temperature_2m)
    : basePoint.temperature;
  const feelsLike = isFiniteNumber(current?.apparent_temperature)
    ? Math.round(current.apparent_temperature)
    : basePoint.feelsLike;
  const humidity = isFiniteNumber(current?.relative_humidity_2m)
    ? Math.round(current.relative_humidity_2m)
    : basePoint.humidity;
  const precipitationMm = isFiniteNumber(current?.precipitation)
    ? Number(current.precipitation.toFixed(1))
    : basePoint.precipitationMm;
  const windSpeed = isFiniteNumber(current?.wind_speed_10m)
    ? Number(current.wind_speed_10m.toFixed(1))
    : basePoint.windSpeed;
  const condition = normalizeOpenMeteoWeatherCode(current?.weather_code);

  return {
    ...basePoint,
    temperature,
    feelsLike,
    humidity,
    precipitationMm,
    windSpeed,
    condition,
    description: getOpenMeteoDescription(basePoint.label, condition),
    updatedAt: current?.time ?? new Date().toISOString(),
  };
}

function getOpenMeteoDescription(label: string, condition: WeatherCondition) {
  const descriptionMap: Record<WeatherCondition, string> = {
    sunny: `${label}은 Open-Meteo 기준 맑은 실시간 상태입니다.`,
    rainy: `${label}은 Open-Meteo 기준 비가 오는 실시간 상태입니다.`,
    cloudy: `${label}은 Open-Meteo 기준 구름이 많은 상태입니다.`,
    snowy: `${label}은 Open-Meteo 기준 눈이 오는 겨울철 상태입니다.`,
    stormy: `${label}은 Open-Meteo 기준 폭풍 가능성이 있는 상태입니다.`,
    foggy: `${label}은 Open-Meteo 기준 시야가 낮은 안개 상태입니다.`,
    unknown: `${label}의 실시간 날씨는 확인됐지만 상태 분류가 아직 명확하지 않습니다.`,
  };

  return descriptionMap[condition];
}

export async function getOpenMeteoWeatherOverlayPoints() {
  const url = buildOpenMeteoOverlayUrl(WEATHER_OVERLAY_POINTS);
  const response = await fetch(url, {
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with ${response.status}`);
  }

  const payload = (await response.json()) as OpenMeteoForecastResponse | OpenMeteoForecastResponse[];
  const responses = Array.isArray(payload) ? payload : [payload];

  return WEATHER_OVERLAY_POINTS.map((point, index) =>
    normalizeOpenMeteoOverlayPoint(point, responses[index]),
  );
}
