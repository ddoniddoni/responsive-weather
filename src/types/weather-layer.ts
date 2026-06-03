export type WeatherLayerId =
  | "temperature"
  | "feels-like"
  | "precipitation"
  | "radar"
  | "wind"
  | "clouds"
  | "pressure"
  | "humidity";

export type WeatherLayer = {
  id: WeatherLayerId;
  label: string;
  shortLabel: string;
  unit: string;
  legendValues: string[];
  legendPalette: string[];
};
