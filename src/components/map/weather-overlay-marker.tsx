import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Marker } from "react-simple-maps";

import type { WeatherOverlayPoint } from "@/types/weather-data";

type WeatherOverlayMarkerProps = {
  point: WeatherOverlayPoint;
  onSelectPoint: (point: WeatherOverlayPoint) => void;
};

const CONDITION_LABEL_MAP: Record<WeatherOverlayPoint["condition"], string> = {
  sunny: "Sunny",
  rainy: "Rain",
  cloudy: "Clouds",
  snowy: "Snow",
  stormy: "Storm",
  foggy: "Fog",
  unknown: "Unknown",
};

function handleMarkerKeyDown(
  event: ReactKeyboardEvent<SVGGElement>,
  point: WeatherOverlayPoint,
  onSelectPoint: (point: WeatherOverlayPoint) => void,
) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  onSelectPoint(point);
}

export function WeatherOverlayMarker({ point, onSelectPoint }: WeatherOverlayMarkerProps) {
  const conditionLabel = CONDITION_LABEL_MAP[point.condition];
  const temperatureLabel = `${point.temperature}°`;
  const ariaLabel = `${point.label}, ${conditionLabel}, ${point.temperature} degrees`;

  return (
    <Marker coordinates={[point.longitude, point.latitude]}>
      <g
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        className={`weather-overlay-marker weather-overlay-marker-${point.condition}`}
        onClick={() => onSelectPoint(point)}
        onKeyDown={(event) => handleMarkerKeyDown(event, point, onSelectPoint)}
      >
        <title>{ariaLabel}</title>
        <circle cx="0" cy="0" r="14" className="weather-overlay-marker-halo" />
        <circle cx="0" cy="0" r="8.5" className="weather-overlay-marker-core" />
        {point.condition === "sunny" ? (
          <g className="weather-overlay-marker-icon weather-overlay-marker-sun" aria-hidden="true">
            <circle cx="0" cy="0" r="4" />
            <line x1="0" y1="-8" x2="0" y2="-11" />
            <line x1="0" y1="8" x2="0" y2="11" />
            <line x1="-8" y1="0" x2="-11" y2="0" />
            <line x1="8" y1="0" x2="11" y2="0" />
          </g>
        ) : null}
        {point.condition === "cloudy" || point.condition === "foggy" ? (
          <g className="weather-overlay-marker-icon weather-overlay-marker-cloud" aria-hidden="true">
            <ellipse cx="0" cy="2" rx="6.8" ry="3.8" />
            <circle cx="-3.2" cy="-1" r="3" />
            <circle cx="2.2" cy="-2.2" r="3.8" />
          </g>
        ) : null}
        {point.condition === "rainy" || point.condition === "stormy" ? (
          <g className="weather-overlay-marker-icon weather-overlay-marker-rain" aria-hidden="true">
            <ellipse cx="0" cy="-1.5" rx="6.8" ry="3.8" />
            <circle cx="-3.5" cy="-4.2" r="2.8" />
            <circle cx="2.2" cy="-5.4" r="3.8" />
            <line x1="-4" y1="5" x2="-5.8" y2="10" />
            <line x1="1" y1="5.5" x2="-0.8" y2="11" />
            {point.condition === "stormy" ? <path d="M4 3 L1 9 H5 L2 15" /> : null}
          </g>
        ) : null}
        {point.condition === "snowy" ? (
          <g className="weather-overlay-marker-icon weather-overlay-marker-snow" aria-hidden="true">
            <line x1="0" y1="-7" x2="0" y2="7" />
            <line x1="-6" y1="-3.5" x2="6" y2="3.5" />
            <line x1="-6" y1="3.5" x2="6" y2="-3.5" />
          </g>
        ) : null}
        <text x="0" y="29" textAnchor="middle" className="weather-overlay-marker-label">
          {temperatureLabel}
        </text>
      </g>
    </Marker>
  );
}
