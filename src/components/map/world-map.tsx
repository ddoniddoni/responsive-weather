"use client";

import { geoCentroid } from "d3-geo";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { ComposableMap, Geographies, Geography, Graticule, Marker, Sphere } from "react-simple-maps";

import { AdminBoundaryLayer } from "@/components/map/admin-boundary-layer";
import { WeatherConditionMarker } from "@/components/map/weather-condition-marker";
import { useAdminBoundaries } from "@/hooks/use-admin-boundaries";
import type { AdminBoundaryLoadStatus } from "@/types/admin-boundary";
import type { WeatherCondition } from "@/types/weather";
import type { SelectedCountry, SelectedRegion } from "@/types/weather-data";

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const LAND_COLORS = ["#b7e4c7", "#d8f3dc", "#a8dadc", "#c7f9cc", "#bee3db"];
const DEFAULT_SCALE = 220;
const MIN_SCALE = 160;
const MAX_SCALE = 5200;
const FOCUSED_SCALE = 520;
const ZOOM_STEP = 220;
const FOCUS_ANIMATION_DURATION = 420;

const MOCK_WEATHER_COUNTRY_CODES: Record<string, string> = {
  France: "FRA",
  Japan: "JPN",
  "South Korea": "KOR",
  "United States of America": "USA",
};

const FOCUSED_SCALE_BY_COUNTRY_CODE: Record<string, number> = {
  FRA: 620,
  JPN: 1500,
  KOR: 2100,
};

type WorldMapProps = {
  selectedCountryCode: string | null;
  selectedCountryName: string | null;
  selectedRegionCode: string | null;
  selectedWeatherCondition: WeatherCondition | null;
  onSelectCountry: (country: SelectedCountry) => void;
  onSelectRegion: (region: SelectedRegion) => void;
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

function clampScale(scale: number) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
}

function clampLatitude(latitude: number) {
  return Math.max(-60, Math.min(60, latitude));
}

function getShortestAngleDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function getFocusedScale(countryCode: string) {
  return FOCUSED_SCALE_BY_COUNTRY_CODE[countryCode] ?? FOCUSED_SCALE;
}

function getAdminBoundaryStatusLabel(status: AdminBoundaryLoadStatus) {
  const labelMap: Record<AdminBoundaryLoadStatus, string | null> = {
    idle: null,
    loading: "Loading regional boundaries",
    success: null,
    error: "Regional boundaries temporarily unavailable",
    unsupported: "Regional boundaries are not available here",
  };

  return labelMap[status];
}

function subscribeToClientMount(onStoreChange: () => void) {
  onStoreChange();

  return () => undefined;
}

function getClientMountSnapshot() {
  return true;
}

function getServerMountSnapshot() {
  return false;
}

export function WorldMap({
  selectedCountryCode,
  selectedCountryName,
  selectedRegionCode,
  selectedWeatherCondition,
  onSelectCountry,
  onSelectRegion,
}: WorldMapProps) {
  const hasMounted = useSyncExternalStore(
    subscribeToClientMount,
    getClientMountSnapshot,
    getServerMountSnapshot,
  );
  const { boundaries, status: adminBoundaryStatus } = useAdminBoundaries(selectedCountryCode);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [rotation, setRotation] = useState<[number, number, number]>([0, -15, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [selectedCountryLabel, setSelectedCountryLabel] = useState<string | null>(null);
  const [selectedMarkerCoordinates, setSelectedMarkerCoordinates] = useState<[number, number] | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const focusAnimationRef = useRef<number | null>(null);
  const adminBoundaryStatusLabel = getAdminBoundaryStatusLabel(adminBoundaryStatus);

  useEffect(() => {
    return () => {
      if (focusAnimationRef.current !== null) {
        window.cancelAnimationFrame(focusAnimationRef.current);
      }
    };
  }, []);

  function handleZoomIn() {
    cancelFocusAnimation();
    applyScaleDelta(ZOOM_STEP);
  }

  function handleZoomOut() {
    cancelFocusAnimation();
    applyScaleDelta(-ZOOM_STEP);
  }

  function handleResetView() {
    cancelFocusAnimation();
    setScale(DEFAULT_SCALE);
    setRotation([0, -15, 0]);
  }

  function applyScaleDelta(delta: number) {
    setScale((previousScale) => clampScale(previousScale + delta));
  }

  function cancelFocusAnimation() {
    if (focusAnimationRef.current === null) {
      return;
    }

    window.cancelAnimationFrame(focusAnimationRef.current);
    focusAnimationRef.current = null;
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    cancelFocusAnimation();
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
      clampLatitude(latitude - deltaY * 0.2),
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
    cancelFocusAnimation();
    applyScaleDelta(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  }

  function focusCoordinates(coordinates: [number, number], targetScale: number) {
    cancelFocusAnimation();

    const [longitude, latitude] = coordinates;
    const fromRotation = rotation;
    const targetRotation: [number, number, number] = [
      -longitude,
      clampLatitude(-latitude),
      fromRotation[2],
    ];
    const fromScale = scale;
    const nextScale = Math.max(targetScale, fromScale);
    const startedAt = window.performance.now();
    const longitudeDelta = getShortestAngleDelta(fromRotation[0], targetRotation[0]);
    const latitudeDelta = targetRotation[1] - fromRotation[1];

    function animate(now: number) {
      const progress = Math.min((now - startedAt) / FOCUS_ANIMATION_DURATION, 1);
      const easedProgress = easeOutCubic(progress);

      setRotation([
        fromRotation[0] + longitudeDelta * easedProgress,
        fromRotation[1] + latitudeDelta * easedProgress,
        fromRotation[2],
      ]);
      setScale(fromScale + (nextScale - fromScale) * easedProgress);

      if (progress < 1) {
        focusAnimationRef.current = window.requestAnimationFrame(animate);
        return;
      }

      focusAnimationRef.current = null;
    }

    focusAnimationRef.current = window.requestAnimationFrame(animate);
  }

  function focusCountry(centroid: [number, number], countryCode: string) {
    focusCoordinates(centroid, getFocusedScale(countryCode));
  }

  function handleSelectRegion(region: SelectedRegion) {
    setSelectedCountryLabel(region.regionName);
    setSelectedMarkerCoordinates(region.coordinates);
    onSelectRegion(region);
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

        {hasMounted ? (
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

            <AdminBoundaryLayer
              boundaries={boundaries}
              countryCode={selectedCountryCode}
              countryName={selectedCountryName}
              selectedRegionCode={selectedRegionCode}
              onSelectRegion={handleSelectRegion}
            />

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
                        focusCountry(centroid, countryCode);
                        onSelectCountry({ code: countryCode, name: countryName });
                      }}
                      className={`outline-none transition-colors ${
                        isSelected ? "pointer-events-none" : "cursor-pointer"
                      }`}
                      style={{
                        default: {
                          fill: isSelected ? "rgba(183, 228, 199, 0.18)" : defaultFill,
                          stroke: isSelected ? "#111827" : "rgba(14, 116, 144, 0.62)",
                          strokeWidth: isSelected ? 1.8 : 0.75,
                        },
                        hover: {
                          fill: "#fde68a",
                          stroke: "#0f172a",
                          strokeWidth: 1.1,
                        },
                        pressed: {
                          fill: "#f59e0b",
                          stroke: "#0f172a",
                          strokeWidth: 1.2,
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
              className="pointer-events-none"
            />

            {selectedMarkerCoordinates && selectedWeatherCondition ? (
              <WeatherConditionMarker
                condition={selectedWeatherCondition}
                coordinates={selectedMarkerCoordinates}
              />
            ) : null}

            {selectedCountryCode && selectedMarkerCoordinates ? (
              <Marker coordinates={selectedMarkerCoordinates}>
                <g className="weather-country-popout-anchor pointer-events-none" aria-hidden="true">
                  <line x1="0" y1="-6" x2="0" y2="-30" className="weather-country-popout-line" />
                  <circle cx="0" cy="-4" r="3.2" className="weather-country-popout-dot" />
                  <foreignObject x="-104" y="-86" width="208" height="54" className="overflow-visible">
                    <div className="weather-country-popout">
                      <span>{selectedCountryLabel}</span>
                    </div>
                  </foreignObject>
                </g>
              </Marker>
            ) : null}
          </ComposableMap>
        ) : (
          <div
            aria-hidden="true"
            className="relative z-10 h-full w-full"
          >
            <div className="absolute left-1/2 top-1/2 h-[min(72vw,480px)] w-[min(72vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100 bg-[radial-gradient(circle_at_38%_30%,#dff9ff_0%,#6bd3f3_42%,#1679a7_78%,#075985_100%)] shadow-[0_24px_32px_rgba(8,47,73,0.32)] dark:border-slate-600" />
          </div>
        )}

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

        {adminBoundaryStatusLabel ? (
          <div
            role="status"
            className="absolute bottom-3 left-3 z-20 max-w-[calc(100%-1.5rem)] rounded-md border border-white/75 bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-600 dark:bg-slate-900/86 dark:text-slate-100"
          >
            {adminBoundaryStatusLabel}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <p>Drag to rotate, use +/- or wheel to zoom, and click a country for details.</p>
        {selectedCountryCode ? (
          <p>
            Regional data:{" "}
            <a
              href="https://www.geoboundaries.org/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-200"
            >
              geoBoundaries gbOpen
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
