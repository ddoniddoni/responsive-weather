import type { WeatherCondition } from "@/types/weather";

export type WeatherData = {
  countryCode: string;
  countryName: string;
  regionCode?: string;
  regionName?: string;
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

export type SelectedRegion = {
  countryCode: string;
  countryName: string;
  regionCode: string;
  regionName: string;
  coordinates: [number, number];
};
