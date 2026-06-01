"use client";

import { geoCentroid } from "d3-geo";
import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { ComposableMap, Geographies, Geography, Graticule, Marker, Sphere } from "react-simple-maps";

import { WeatherConditionMarker } from "@/components/map/weather-condition-marker";
import type { WeatherCondition } from "@/types/weather";
import type { SelectedCountry } from "@/types/weather-data";

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const LAND_COLORS = ["#b7e4c7", "#d8f3dc", "#a8dadc", "#c7f9cc", "#bee3db"];
const DEFAULT_SCALE = 220;
const MIN_SCALE = 160;
const MAX_SCALE = 820;
const ZOOM_STEP = 40;

const MOCK_WEATHER_COUNTRY_CODES: Record<string, string> = {
  France: "FRA",
  Japan: "JPN",
  "South Korea": "KOR",
  "United States of America": "USA",
};

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
  id?: string | number;
  properties: GeographyProperties;
  geometry: unknown;
};

function getCountryCode(feature: GeographyFeature, countryName: string) {
  return (
    feature.properties.iso_a3 ??
    feature.properties.ISO_A3 ??
    MOCK_WEATHER_COUNTRY_CODES[countryName] ??
    String(feature.id ?? feature.rsmKey)
  );
}

export function WorldMap({
  selectedCountryCode,
  selectedWeatherCondition,
  onSelectCountry,
}: WorldMapProps) {
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [rotation, setRotation] = useState<[number, number, number]>([0, -15, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [selectedCountryLabel, setSelectedCountryLabel] = useState<string | null>(null);
  const [selectedMarkerCoordinates, setSelectedMarkerCoordinates] = useState<[number, number] | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  function handleZoomIn() {
    applyScaleDelta(ZOOM_STEP);
  }

  function handleZoomOut() {
    applyScaleDelta(-ZOOM_STEP);
  }

  function handleResetView() {
    setScale(DEFAULT_SCALE);
    setRotation([0, -15, 0]);
  }

  function applyScaleDelta(delta: number) {
    setScale((previousScale) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, previousScale + delta)));
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
    applyScaleDelta(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-[0_20px_60px_rgba(12,74,110,0.12)] dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-12 items-center justify-between border-b border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 px-4 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
          {hoveredCountryName ?? selectedCountryLabel ?? "지도에서 국가를 선택하세요"}
        </p>
        <span className="hidden text-xs font-medium text-cyan-700 dark:text-cyan-200 sm:inline">
          Interactive Globe
        </span>
      </div>

      <div
        className={`weather-map-stage relative h-[56vh] min-h-[320px] max-h-[620px] w-full overflow-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className="weather-map-aurora" aria-hidden="true" />
        <div className="weather-map-grid" aria-hidden="true" />

        <ComposableMap
          projection="geoOrthographic"
          projectionConfig={{ scale, rotate: rotation }}
          className="relative z-10 h-full w-full drop-shadow-[0_24px_32px_rgba(8,47,73,0.32)]"
          aria-label="World map"
        >
          <defs>
            <radialGradient id="globeOceanGradient" cx="38%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#dff9ff" />
              <stop offset="42%" stopColor="#6bd3f3" />
              <stop offset="78%" stopColor="#1679a7" />
              <stop offset="100%" stopColor="#075985" />
            </radialGradient>
            <radialGradient id="globeShadeGradient" cx="34%" cy="26%" r="74%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="58%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0.34)" />
            </radialGradient>
          </defs>

          <Sphere
            id="globe-ocean"
            fill="url(#globeOceanGradient)"
            stroke="rgba(224,242,254,0.9)"
            strokeWidth={0.8}
          />
          <Graticule stroke="rgba(240,249,255,0.32)" strokeWidth={0.35} />

          <Geographies geography={WORLD_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geography, index) => {
                const feature = geography as GeographyFeature;
                const countryName = feature.properties.name ?? feature.properties.NAME ?? "Unknown";
                const countryCode = getCountryCode(feature, countryName);
                const isSelected = selectedCountryCode === countryCode;
                const centroid = geoCentroid(feature as never) as [number, number];
                const defaultFill = LAND_COLORS[index % LAND_COLORS.length];

                return (
                  <Geography
                    key={feature.rsmKey}
                    geography={geography}
                    onMouseEnter={() => setHoveredCountryName(countryName)}
                    onMouseLeave={() => setHoveredCountryName(null)}
                    onClick={() => {
                      setSelectedCountryLabel(countryName);
                      setSelectedMarkerCoordinates(centroid);
                      onSelectCountry({ code: countryCode, name: countryName });
                    }}
                    className="cursor-pointer outline-none transition-colors"
                    style={{
                      default: {
                        fill: defaultFill,
                        stroke: isSelected ? "#facc15" : "rgba(255,255,255,0.78)",
                        strokeWidth: isSelected ? 1.4 : 0.5,
                      },
                      hover: {
                        fill: "#fde68a",
                        stroke: "#ffffff",
                        strokeWidth: 0.9,
                      },
                      pressed: {
                        fill: "#f59e0b",
                        stroke: "#ffffff",
                        strokeWidth: 0.9,
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          <Sphere
            id="globe-shade"
            fill="url(#globeShadeGradient)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={0.8}
          />

          {selectedMarkerCoordinates && selectedWeatherCondition ? (
            <WeatherConditionMarker
              condition={selectedWeatherCondition}
              coordinates={selectedMarkerCoordinates}
            />
          ) : null}

          {selectedCountryCode && selectedMarkerCoordinates ? (
            <Marker coordinates={selectedMarkerCoordinates}>
              <g className="weather-country-popout-anchor">
                <line x1="0" y1="-6" x2="0" y2="-26" className="weather-country-popout-line" />
                <circle cx="0" cy="-4" r="3.2" className="weather-country-popout-dot" />
                <foreignObject x="-78" y="-72" width="156" height="44" className="overflow-visible">
                  <div className="weather-country-popout">
                    <span>{selectedCountryLabel}</span>
                  </div>
                </foreignObject>
              </g>
            </Marker>
          ) : null}
        </ComposableMap>

        <div className="absolute right-2 top-2 z-20 flex gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="지도 확대"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/70 bg-white/90 text-slate-900 shadow-sm backdrop-blur hover:bg-white dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="지도 축소"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/70 bg-white/90 text-slate-900 shadow-sm backdrop-blur hover:bg-white dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            -
          </button>
          <button
            type="button"
            onClick={handleResetView}
            aria-label="지도 초기 위치로 이동"
            className="inline-flex h-8 items-center justify-center rounded-md border border-white/70 bg-white/90 px-2 text-xs text-slate-900 shadow-sm backdrop-blur hover:bg-white dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      <p className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
        Drag to rotate, use +/- or wheel to zoom, and click a country for details.
      </p>
    </div>
  );
}
