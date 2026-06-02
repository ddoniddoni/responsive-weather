import type { WeatherCondition } from "@/types/weather";

type WeatherConditionEffectsProps = {
  condition: WeatherCondition;
};

export function WeatherConditionEffects({ condition }: WeatherConditionEffectsProps) {
  const isSunny = condition === "sunny";
  const isRainy = condition === "rainy";
  const isCloudy = condition === "cloudy";

  return (
    <>
      {isSunny ? (
        <span
          aria-hidden="true"
          className="weather-sun absolute -right-1 -top-1 h-4 w-4"
        />
      ) : null}
      {isRainy ? (
        <span aria-hidden="true" className="weather-rain absolute inset-0">
          <span className="weather-rain-drop weather-rain-drop-1" />
          <span className="weather-rain-drop weather-rain-drop-2" />
          <span className="weather-rain-drop weather-rain-drop-3" />
          <span className="weather-rain-drop weather-rain-drop-4" />
        </span>
      ) : null}
      {isCloudy ? (
        <span aria-hidden="true" className="weather-cloud absolute inset-0">
          <span className="weather-cloud-shape" />
          <span className="weather-cloud-shape weather-cloud-shape-2" />
        </span>
      ) : null}
    </>
  );
}
