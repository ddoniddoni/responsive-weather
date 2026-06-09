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
    description: "전국적으로 옅은 구름이 지나고 있으며, 해안 지역은 약한 바람이 이어집니다.",
  },
  USA: {
    temperature: 28,
    feelsLike: 30,
    humidity: 41,
    windSpeed: 4.2,
    pressureHpa: 1019,
    visibilityKm: 18,
    condition: "sunny",
    description: "대체로 맑고 건조합니다. 낮 동안 시야가 넓게 열리는 안정적인 날씨입니다.",
  },
  JPN: {
    temperature: 19,
    feelsLike: 19,
    humidity: 76,
    windSpeed: 2.9,
    pressureHpa: 1008,
    visibilityKm: 7,
    condition: "rainy",
    description: "약한 비구름대가 이어지며 습도가 높습니다. 이동 시 우산을 챙기는 편이 좋습니다.",
  },
  FRA: {
    temperature: 17,
    feelsLike: 16,
    humidity: 69,
    windSpeed: 5.1,
    pressureHpa: 1012,
    visibilityKm: 10,
    condition: "cloudy",
    description: "서늘한 공기와 낮은 구름이 머물며, 오후에는 바람이 조금 강해질 수 있습니다.",
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
    description: "건조한 공기와 맑은 하늘이 이어지는 캘리포니아권 날씨입니다.",
  },
  "USA:US-NY": {
    temperature: 18,
    feelsLike: 17,
    humidity: 67,
    windSpeed: 4.7,
    pressureHpa: 1011,
    visibilityKm: 11,
    condition: "cloudy",
    description: "뉴욕 일대는 구름이 많고 체감 온도가 실제 기온보다 낮게 느껴집니다.",
  },
  "JPN:JP-13": {
    temperature: 20,
    feelsLike: 20,
    humidity: 74,
    windSpeed: 3.1,
    pressureHpa: 1009,
    visibilityKm: 8,
    condition: "rainy",
    description: "도쿄권에는 약한 비가 지나가며 도로와 보행 환경이 다소 습합니다.",
  },
  "KOR:KR-11": {
    temperature: 22,
    feelsLike: 23,
    humidity: 61,
    windSpeed: 2.8,
    pressureHpa: 1014,
    visibilityKm: 13,
    condition: "cloudy",
    description: "서울은 부드러운 구름과 약한 바람이 섞인 차분한 날씨입니다.",
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
  description: "이 위치의 상세 예보를 준비하고 있습니다. 현재는 기본 예시 데이터를 표시합니다.",
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
    description: `${regionName} 지역의 대표 좌표를 기준으로 산출한 예시 날씨입니다.`,
  };
}
