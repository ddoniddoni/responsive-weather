import type { SelectedRegion, WeatherData } from "@/types/weather-data";

const WEATHER_DATA_BY_COUNTRY: Record<string, Omit<WeatherData, "countryCode" | "countryName">> = {
  KOR: {
    temperature: 23,
    feelsLike: 24,
    humidity: 52,
    windSpeed: 3.8,
    pressureHpa: 1016,
    visibilityKm: 14,
    condition: "cloudy",
    description: "구름이 넓게 깔려 있고 해안 쪽으로 약한 바람이 불고 있습니다.",
  },
  USA: {
    temperature: 28,
    feelsLike: 30,
    humidity: 41,
    windSpeed: 4.2,
    pressureHpa: 1019,
    visibilityKm: 18,
    condition: "sunny",
    description: "맑고 건조한 날씨로 낮 동안 시야가 매우 좋습니다.",
  },
  JPN: {
    temperature: 19,
    feelsLike: 19,
    humidity: 76,
    windSpeed: 2.9,
    pressureHpa: 1008,
    visibilityKm: 7,
    condition: "rainy",
    description: "약한 비구름대가 지나가며 습도가 높게 유지되고 있습니다.",
  },
  FRA: {
    temperature: 17,
    feelsLike: 16,
    humidity: 69,
    windSpeed: 5.1,
    pressureHpa: 1012,
    visibilityKm: 10,
    condition: "cloudy",
    description: "선선한 공기와 층운이 이어지며 차분한 날씨입니다.",
  },
};

const WEATHER_DATA_BY_REGION: Record<
  string,
  Omit<WeatherData, "countryCode" | "countryName" | "regionCode" | "regionName">
> = {
  "USA:US-CA": {
    temperature: 24,
    feelsLike: 25,
    humidity: 48,
    windSpeed: 3.4,
    pressureHpa: 1018,
    visibilityKm: 17,
    condition: "sunny",
    description: "건조한 공기와 밝은 하늘이 이어지는 맑은 지역 날씨입니다.",
  },
  "USA:US-NY": {
    temperature: 18,
    feelsLike: 17,
    humidity: 67,
    windSpeed: 4.7,
    pressureHpa: 1011,
    visibilityKm: 11,
    condition: "cloudy",
    description: "선택한 지역 전반에 구름이 점차 늘고 있습니다.",
  },
  "JPN:JP-13": {
    temperature: 20,
    feelsLike: 20,
    humidity: 74,
    windSpeed: 3.1,
    pressureHpa: 1009,
    visibilityKm: 8,
    condition: "rainy",
    description: "선택한 지역에 약한 비가 지나가고 있습니다.",
  },
  "KOR:KR-11": {
    temperature: 22,
    feelsLike: 23,
    humidity: 61,
    windSpeed: 2.8,
    pressureHpa: 1014,
    visibilityKm: 13,
    condition: "cloudy",
    description: "부드러운 구름과 약한 바람이 지역 날씨를 만들고 있습니다.",
  },
};

const DEFAULT_WEATHER: Omit<WeatherData, "countryCode" | "countryName"> = {
  temperature: 21,
  feelsLike: 21,
  humidity: 58,
  windSpeed: 3.3,
  pressureHpa: 1013,
  visibilityKm: 12,
  condition: "unknown",
  description: "이 위치의 상세 예시 날씨 데이터를 준비하고 있습니다.",
};

export function getMockWeatherByCountry(countryCode: string, countryName: string): WeatherData {
  const weather = WEATHER_DATA_BY_COUNTRY[countryCode] ?? DEFAULT_WEATHER;

  return {
    countryCode,
    countryName,
    ...weather,
    sourceLabel: "Mock country preview",
  };
}

export function getMockWeatherByRegion(region: SelectedRegion): WeatherData {
  const regionWeather = WEATHER_DATA_BY_REGION[`${region.countryCode}:${region.regionCode}`];
  const fallbackWeather = getRegionFallbackWeather(region.regionCode, region.regionName);
  const weather = regionWeather ?? fallbackWeather;

  return {
    countryCode: region.countryCode,
    countryName: region.countryName,
    regionCode: region.regionCode,
    regionName: region.regionName,
    ...weather,
    sourceLabel: "Mock regional preview",
  };
}

function getRegionFallbackWeather(
  regionCode: string,
  regionName: string,
): Omit<WeatherData, "countryCode" | "countryName" | "regionCode" | "regionName"> {
  const conditionCycle = ["sunny", "cloudy", "rainy"] as const;
  const seed = Array.from(`${regionCode}:${regionName}`).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const condition = conditionCycle[seed % conditionCycle.length];
  const temperature = 14 + (seed % 18);
  const pressureHpa = 1004 + (seed % 28);
  const visibilityKm = 6 + (seed % 16);

  return {
    temperature,
    feelsLike: temperature + ((seed % 5) - 2),
    humidity: 42 + (seed % 43),
    windSpeed: Number((1.8 + (seed % 48) / 10).toFixed(1)),
    pressureHpa,
    visibilityKm,
    condition,
    description: `${regionName} 지역 예시 날씨를 확인할 수 있습니다.`,
  };
}
