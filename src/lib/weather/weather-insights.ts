import type { WeatherData } from "@/types/weather-data";

export type WeatherInsight = {
  label: string;
  value: string;
  helperText: string;
};

function getComfortSignal(weather: WeatherData) {
  if (weather.humidity >= 72) {
    return "습함";
  }

  if (weather.windSpeed >= 5) {
    return "바람 강함";
  }

  if (Math.abs(weather.temperature - weather.feelsLike) >= 3) {
    return "체감 차이";
  }

  return "안정적";
}

function getVisibilitySignal(visibilityKm: number) {
  if (visibilityKm >= 15) {
    return "시야 좋음";
  }

  if (visibilityKm >= 9) {
    return "보통";
  }

  return "주의";
}

function getPressureSignal(pressureHpa: number) {
  if (pressureHpa >= 1018) {
    return "고기압";
  }

  if (pressureHpa <= 1008) {
    return "저기압";
  }

  return "안정권";
}

export function getWeatherInsights(weather: WeatherData): WeatherInsight[] {
  return [
    {
      label: "쾌적도",
      value: getComfortSignal(weather),
      helperText: `체감 ${weather.feelsLike}\u00b0C / 습도 ${weather.humidity}%`,
    },
    {
      label: "가시거리",
      value: `${weather.visibilityKm} km`,
      helperText: getVisibilitySignal(weather.visibilityKm),
    },
    {
      label: "기압",
      value: `${weather.pressureHpa} hPa`,
      helperText: getPressureSignal(weather.pressureHpa),
    },
  ];
}
