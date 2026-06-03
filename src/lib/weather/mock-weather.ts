import type { SelectedRegion, WeatherData } from "@/types/weather-data";

const WEATHER_DATA_BY_COUNTRY: Record<string, Omit<WeatherData, "countryCode" | "countryName">> = {
  KOR: {
    temperature: 23,
    feelsLike: 24,
    humidity: 52,
    windSpeed: 3.8,
    condition: "cloudy",
    description: "Cloud cover is steady with a light coastal breeze across the region.",
  },
  USA: {
    temperature: 28,
    feelsLike: 30,
    humidity: 41,
    windSpeed: 4.2,
    condition: "sunny",
    description: "Clear and dry conditions are supporting strong daytime visibility.",
  },
  JPN: {
    temperature: 19,
    feelsLike: 19,
    humidity: 76,
    windSpeed: 2.9,
    condition: "rainy",
    description: "A light rain band is moving through with elevated humidity.",
  },
  FRA: {
    temperature: 17,
    feelsLike: 16,
    humidity: 69,
    windSpeed: 5.1,
    condition: "cloudy",
    description: "Cooler air and layered clouds are keeping conditions subdued.",
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
    condition: "sunny",
    description: "Clear regional weather with dry air and bright skies.",
  },
  "USA:US-NY": {
    temperature: 18,
    feelsLike: 17,
    humidity: 67,
    windSpeed: 4.7,
    condition: "cloudy",
    description: "Cloud cover is building across the selected region.",
  },
  "JPN:JP-13": {
    temperature: 20,
    feelsLike: 20,
    humidity: 74,
    windSpeed: 3.1,
    condition: "rainy",
    description: "Light rain is moving through the selected prefecture.",
  },
  "KOR:KR-11": {
    temperature: 22,
    feelsLike: 23,
    humidity: 61,
    windSpeed: 2.8,
    condition: "cloudy",
    description: "Soft clouds and mild wind are shaping the regional weather.",
  },
};

const DEFAULT_WEATHER: Omit<WeatherData, "countryCode" | "countryName"> = {
  temperature: 21,
  feelsLike: 21,
  humidity: 58,
  windSpeed: 3.3,
  condition: "unknown",
  description: "Detailed mock weather for this location is being prepared.",
};

export function getMockWeatherByCountry(countryCode: string, countryName: string): WeatherData {
  const weather = WEATHER_DATA_BY_COUNTRY[countryCode] ?? DEFAULT_WEATHER;

  return {
    countryCode,
    countryName,
    ...weather,
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

  return {
    temperature,
    feelsLike: temperature + ((seed % 5) - 2),
    humidity: 42 + (seed % 43),
    windSpeed: Number((1.8 + (seed % 48) / 10).toFixed(1)),
    condition,
    description: `${regionName} regional mock weather is ready for panel preview.`,
  };
}
