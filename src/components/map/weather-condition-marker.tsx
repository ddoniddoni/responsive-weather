import { Marker } from "react-simple-maps";

import type { WeatherCondition } from "@/types/weather";

type WeatherConditionMarkerProps = {
  condition: WeatherCondition;
  coordinates: [number, number];
};

export function WeatherConditionMarker({ condition, coordinates }: WeatherConditionMarkerProps) {
  if (condition === "unknown") {
    return null;
  }

  return (
    <Marker coordinates={coordinates}>
      <g className="weather-map-marker pointer-events-none" aria-hidden="true">
        <ellipse cx="0" cy="14" rx="18" ry="6" className="weather-map-shadow" />
        {condition === "sunny" ? (
          <g className="weather-map-sun">
            <circle cx="0" cy="0" r="8" />
          </g>
        ) : null}
        {condition === "cloudy" ? (
          <g className="weather-map-cloud">
            <ellipse cx="0" cy="2" rx="12" ry="7" />
            <circle cx="-5" cy="-3" r="5" />
            <circle cx="3" cy="-5" r="7" />
          </g>
        ) : null}
        {condition === "rainy" ? (
          <g className="weather-map-rain">
            <g className="weather-map-cloud">
              <ellipse cx="0" cy="-1" rx="12" ry="7" />
              <circle cx="-6" cy="-5" r="5" />
              <circle cx="2" cy="-7" r="7" />
            </g>
            <line x1="-7" y1="8" x2="-10" y2="16" />
            <line x1="0" y1="8" x2="-2" y2="17" />
            <line x1="7" y1="8" x2="4" y2="16" />
          </g>
        ) : null}
      </g>
    </Marker>
  );
}
