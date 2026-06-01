import type { WeatherData } from "@/types/weather-data";

const WEATHER_DATA_BY_COUNTRY: Record<string, Omit<WeatherData, "countryCode" | "countryName">> = {
  KOR: {
    temperature: 23,
    feelsLike: 24,
    humidity: 52,
    windSpeed: 3.8,
    condition: "cloudy",
    description: "구름이 많고 바람이 약하게 붑니다.",
  },
  USA: {
    temperature: 28,
    feelsLike: 30,
    humidity: 41,
    windSpeed: 4.2,
    condition: "sunny",
    description: "맑고 건조한 날씨입니다.",
  },
  JPN: {
    temperature: 19,
    feelsLike: 19,
    humidity: 76,
    windSpeed: 2.9,
    condition: "rainy",
    description: "약한 비가 내리고 있습니다.",
  },
  FRA: {
    temperature: 17,
    feelsLike: 16,
    humidity: 69,
    windSpeed: 5.1,
    condition: "cloudy",
    description: "흐리고 선선한 날씨입니다.",
  },
};

const DEFAULT_WEATHER: Omit<WeatherData, "countryCode" | "countryName"> = {
  temperature: 21,
  feelsLike: 21,
  humidity: 58,
  windSpeed: 3.3,
  condition: "unknown",
  description: "현재 지역의 상세 날씨는 준비 중입니다.",
};

export function getMockWeatherByCountry(countryCode: string, countryName: string): WeatherData {
  const weather = WEATHER_DATA_BY_COUNTRY[countryCode] ?? DEFAULT_WEATHER;

  return {
    countryCode,
    countryName,
    ...weather,
  };
}
