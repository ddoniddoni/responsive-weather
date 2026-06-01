import type { WeatherCondition } from "@/types/weather";

export type WeatherData = {
  countryCode: string;
  countryName: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: WeatherCondition;
  description: string;
};

export type SelectedCountry = {
  code: string;
  name: string;
};
