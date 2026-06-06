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
  pressureHpa: number;
  visibilityKm: number;
  condition: WeatherCondition;
  description: string;
  updatedAt?: string;
  sourceLabel?: string;
};

export type SelectedCountry = {
  code: string;
  name: string;
  coordinates?: [number, number];
};

export type SelectedRegion = {
  countryCode: string;
  countryName: string;
  regionCode: string;
  regionName: string;
  coordinates: [number, number];
};

export type WeatherOverlayPoint = {
  id: string;
  countryCode: string;
  countryName: string;
  label: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  precipitationMm?: number;
  condition: WeatherCondition;
  description?: string;
  updatedAt: string;
};
