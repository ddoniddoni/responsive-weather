"use client";

import { geoCentroid } from "d3-geo";
import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import { WeatherConditionMarker } from "@/components/map/weather-condition-marker";
import type { WeatherCondition } from "@/types/weather";
import type { SelectedCountry } from "@/types/weather-data";

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type WorldMapProps = {
  selectedCountryCode: string | null;
  selectedWeatherCondition: WeatherCondition | null;
  onSelectCountry: (country: SelectedCountry) => void;
};

type GeographyProperties = {
  name?: string;
  NAME?: string;
  iso_a3?: string;
  ISO_A3?: string;
};

type GeographyFeature = {
  rsmKey: string;
  properties: GeographyProperties;
  geometry: unknown;
};

export function WorldMap({
  selectedCountryCode,
  selectedWeatherCondition,
  onSelectCountry,
}: WorldMapProps) {
  const [scale, setScale] = useState(220);
  const [rotation, setRotation] = useState<[number, number, number]>([0, -15, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [selectedCountryLabel, setSelectedCountryLabel] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const selectedCountryCoordinatesRef = useRef<[number, number] | null>(null);

  const selectedMarkerCoordinates = selectedCountryCoordinatesRef.current;

  function handleZoomIn() {
    applyScaleDelta(20);
  }

  function handleZoomOut() {
    applyScaleDelta(-20);
  }

  function handleResetView() {
    setScale(220);
    setRotation([0, -15, 0]);
  }

  function applyScaleDelta(delta: number) {
    setScale((previousScale) => Math.max(160, Math.min(520, previousScale + delta)));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragStartRef.current) {
      return;
    }

    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;

    setRotation(([longitude, latitude, gamma]) => [
      longitude + deltaX * 0.25,
      Math.max(-60, Math.min(60, latitude - deltaY * 0.2)),
      gamma,
    ]);

    dragStartRef.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp() {
    setIsDragging(false);
    dragStartRef.current = null;
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const zoomDelta = event.deltaY < 0 ? 20 : -20;
    applyScaleDelta(zoomDelta);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2 flex h-6 items-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {hoveredCountryName ?? selectedCountryLabel ?? "국가 위에 마우스를 올려 이름을 확인하세요."}
        </p>
      </div>
      <div
        className={`relative h-[56vh] min-h-[320px] max-h-[620px] w-full overflow-hidden rounded-xl ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <ComposableMap
          projection="geoOrthographic"
          projectionConfig={{ scale, rotate: rotation }}
          className="h-full w-full"
          aria-label="World map"
        >
          <Geographies geography={WORLD_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geography) => {
                const feature = geography as GeographyFeature;
                const countryName = feature.properties.name ?? feature.properties.NAME ?? "Unknown";
                const countryCode = feature.properties.iso_a3 ?? feature.properties.ISO_A3 ?? "UNK";
                const isSelected = selectedCountryCode === countryCode;
                const centroid = geoCentroid(feature as never) as [number, number];

                if (isSelected) {
                  selectedCountryCoordinatesRef.current = centroid;
                }

                return (
                  <Geography
                    key={feature.rsmKey}
                    geography={geography}
                    onMouseEnter={() => setHoveredCountryName(countryName)}
                    onMouseLeave={() => setHoveredCountryName(null)}
                    onClick={() => {
                      setSelectedCountryLabel(countryName);
                      selectedCountryCoordinatesRef.current = centroid;
                      onSelectCountry({ code: countryCode, name: countryName });
                    }}
                    className="cursor-pointer outline-none"
                    style={{
                      default: {
                        fill: isSelected ? "#60a5fa" : "#dbeafe",
                        stroke: "#94a3b8",
                        strokeWidth: 0.5,
                      },
                      hover: {
                        fill: "#93c5fd",
                        stroke: "#64748b",
                        strokeWidth: 0.6,
                      },
                      pressed: {
                        fill: "#3b82f6",
                        stroke: "#475569",
                        strokeWidth: 0.6,
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
          {selectedCountryCode && selectedMarkerCoordinates ? (
            <Marker coordinates={selectedMarkerCoordinates}>
              <text
                y={-16}
                textAnchor="middle"
                className="fill-slate-800 text-[10px] font-semibold dark:fill-slate-100"
              >
                {selectedCountryLabel}
              </text>
            </Marker>
          ) : null}
          {selectedMarkerCoordinates && selectedWeatherCondition ? (
            <WeatherConditionMarker
              condition={selectedWeatherCondition}
              coordinates={selectedMarkerCoordinates}
            />
          ) : null}
        </ComposableMap>
        <div className="absolute right-2 top-2 flex gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="지도 확대"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="지도 축소"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            -
          </button>
          <button
            type="button"
            onClick={handleResetView}
            aria-label="지도 초기 위치로 이동"
            className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 shadow-sm hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
        Drag to rotate, use +/- or wheel to zoom, and click a country for details.
      </p>
    </div>
  );
}
