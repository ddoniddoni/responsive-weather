import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Marker } from "react-simple-maps";

import type { WeatherOverlayPoint } from "@/types/weather-data";

type WeatherOverlayMarkerProps = {
  point: WeatherOverlayPoint;
  onSelectPoint: (point: WeatherOverlayPoint) => void;
  scale?: number;
  visualOnly?: boolean;
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

const MARKER_VISUAL_MAP: Record<
  WeatherOverlayPoint["condition"],
  {
    dotFill: string;
  }
> = {
  sunny: {
    dotFill: "#d97706",
  },
  cloudy: {
    dotFill: "#64748b",
  },
  foggy: {
    dotFill: "#94a3b8",
  },
  rainy: {
    dotFill: "#0284c7",
  },
  stormy: {
    dotFill: "#7c3aed",
  },
  snowy: {
    dotFill: "#0891b2",
  },
  unknown: {
    dotFill: "#94a3b8",
  },
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

export function WeatherOverlayMarker({
  point,
  onSelectPoint,
  scale = 1,
  visualOnly = false,
}: WeatherOverlayMarkerProps) {
  const conditionLabel = CONDITION_LABEL_MAP[point.condition];
  const temperatureLabel = `${point.temperature}\u00b0C`;
  const ariaLabel = `${point.label}, ${conditionLabel}, ${point.temperature} degrees`;
  const markerVisual = MARKER_VISUAL_MAP[point.condition];

  return (
    <Marker coordinates={[point.longitude, point.latitude]}>
      <g
        role={visualOnly ? undefined : "button"}
        tabIndex={visualOnly ? undefined : 0}
        aria-hidden={visualOnly}
        aria-label={visualOnly ? undefined : ariaLabel}
        className={`weather-overlay-marker weather-overlay-marker-${point.condition}`}
        onClick={visualOnly ? undefined : () => onSelectPoint(point)}
        onKeyDown={visualOnly ? undefined : (event) => handleMarkerKeyDown(event, point, onSelectPoint)}
        style={{ pointerEvents: visualOnly ? "none" : "auto" }}
      >
        <title>{ariaLabel}</title>
        <g transform={`scale(${scale})`}>
          <circle
            cx="0"
            cy="-7"
            r="2.8"
            className="weather-overlay-marker-dot"
            fill={markerVisual.dotFill}
            style={{ fill: markerVisual.dotFill }}
          />
          <text x="0" y="7" textAnchor="middle" className="weather-overlay-marker-label">
            {temperatureLabel}
          </text>
        </g>
      </g>
    </Marker>
  );
}
