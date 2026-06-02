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
      <g className="weather-globe-marker">
        <ellipse cx="0" cy="14" rx="18" ry="6" className="weather-globe-shadow" />
        {condition === "sunny" ? (
          <g className="weather-globe-sun">
            <circle cx="0" cy="0" r="10" />
          </g>
        ) : null}
        {condition === "cloudy" ? (
          <g className="weather-globe-cloud">
            <ellipse cx="0" cy="2" rx="14" ry="8" />
            <circle cx="-6" cy="-3" r="6" />
            <circle cx="3" cy="-5" r="8" />
          </g>
        ) : null}
        {condition === "rainy" ? (
          <g className="weather-globe-rain">
            <g className="weather-globe-cloud">
              <ellipse cx="0" cy="-1" rx="13" ry="7" />
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
