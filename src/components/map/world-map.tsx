"use client";

import { geoCentroid } from "d3-geo";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import { ComposableMap, Geographies, Geography, Graticule, Marker, Sphere } from "react-simple-maps";

import { RegionalMap } from "@/components/map/regional-map";
import { WeatherConditionMarker } from "@/components/map/weather-condition-marker";
import { useAdminBoundaries } from "@/hooks/use-admin-boundaries";
import type { AdminBoundaryLoadStatus } from "@/types/admin-boundary";
import type { MapMode } from "@/types/map-mode";
import type { WeatherCondition } from "@/types/weather";
import type { SelectedCountry, SelectedRegion } from "@/types/weather-data";

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const LAND_COLORS = ["#9ca3af", "#a7b0ba", "#8fa2ad", "#b0a494", "#93a69a"];
const DEFAULT_SCALE = 220;
const MIN_SCALE = 160;
const MAX_SCALE = 5200;
const FOCUSED_SCALE = 520;
const ZOOM_STEP = 220;
const FOCUS_ANIMATION_DURATION = 420;
const DRAG_LONGITUDE_SENSITIVITY = 0.12;
const DRAG_LATITUDE_SENSITIVITY = 0.1;

const MOCK_WEATHER_COUNTRY_CODES: Record<string, string> = {
  France: "FRA",
  Japan: "JPN",
  "South Korea": "KOR",
  "United States of America": "USA",
};

const FOCUSED_SCALE_BY_COUNTRY_CODE: Record<string, number> = {
  FRA: 620,
  JPN: 1500,
  KOR: 1800,
};

type WorldMapProps = {
  activeLayerId?: string;
  selectedCountryCode: string | null;
  selectedCountryName: string | null;
  selectedCountryCoordinates: [number, number] | null;
  selectedRegionCode: string | null;
  selectedWeatherCondition: WeatherCondition | null;
  variant?: "panel" | "immersive";
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
  activeLayerId = "temperature",
  selectedCountryCode,
  selectedCountryName,
  selectedCountryCoordinates: selectedCountryCoordinatesFromProps,
  selectedRegionCode,
  selectedWeatherCondition,
  variant = "panel",
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
  const [selectedCountryCoordinates, setSelectedCountryCoordinates] = useState<[number, number] | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>("globe");
  const scaleRef = useRef(DEFAULT_SCALE);
  const rotationRef = useRef<[number, number, number]>([0, -15, 0]);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const focusAnimationRef = useRef<number | null>(null);
  const adminBoundaryStatusLabel = getAdminBoundaryStatusLabel(adminBoundaryStatus);
  const isRegionalMode = mapMode === "regional" && Boolean(selectedCountryCode && selectedCountryName);
  const canShowDetailButton = mapMode === "globe" && adminBoundaryStatus === "success";
  const isImmersive = variant === "immersive";

  const cancelFocusAnimation = useCallback(() => {
    if (focusAnimationRef.current === null) {
      return;
    }

    window.cancelAnimationFrame(focusAnimationRef.current);
    focusAnimationRef.current = null;
  }, []);

  const applyScaleDelta = useCallback((delta: number) => {
    setScale((currentScale) => {
      const nextScale = clampScale(currentScale + delta);

      scaleRef.current = nextScale;

      return nextScale;
    });
  }, []);

  const focusCoordinates = useCallback(
    (coordinates: [number, number], targetScale: number) => {
      cancelFocusAnimation();

      const [longitude, latitude] = coordinates;
      const fromRotation = rotationRef.current;
      const targetRotation: [number, number, number] = [
        -longitude,
        clampLatitude(-latitude),
        fromRotation[2],
      ];
      const fromScale = scaleRef.current;
      const nextScale = Math.max(targetScale, fromScale);
      const startedAt = window.performance.now();
      const longitudeDelta = getShortestAngleDelta(fromRotation[0], targetRotation[0]);
      const latitudeDelta = targetRotation[1] - fromRotation[1];

      function animate(now: number) {
        const progress = Math.min((now - startedAt) / FOCUS_ANIMATION_DURATION, 1);
        const easedProgress = easeOutCubic(progress);
        const nextRotation: [number, number, number] = [
          fromRotation[0] + longitudeDelta * easedProgress,
          fromRotation[1] + latitudeDelta * easedProgress,
          fromRotation[2],
        ];
        const animatedScale = fromScale + (nextScale - fromScale) * easedProgress;

        rotationRef.current = nextRotation;
        scaleRef.current = animatedScale;
        setRotation(nextRotation);
        setScale(animatedScale);

        if (progress < 1) {
          focusAnimationRef.current = window.requestAnimationFrame(animate);
          return;
        }

        focusAnimationRef.current = null;
      }

      focusAnimationRef.current = window.requestAnimationFrame(animate);
    },
    [cancelFocusAnimation],
  );

  const focusCountry = useCallback(
    (centroid: [number, number], countryCode: string) => {
      focusCoordinates(centroid, getFocusedScale(countryCode));
    },
    [focusCoordinates],
  );

  useEffect(() => {
    return cancelFocusAnimation;
  }, [cancelFocusAnimation]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    if (!selectedCountryCode || !selectedCountryName || !selectedCountryCoordinatesFromProps) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      setMapMode("globe");
      focusCountry(selectedCountryCoordinatesFromProps, selectedCountryCode);
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [focusCountry, selectedCountryCode, selectedCountryCoordinatesFromProps, selectedCountryName]);

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
    setMapMode("globe");
    scaleRef.current = DEFAULT_SCALE;
    rotationRef.current = [0, -15, 0];
    setScale(DEFAULT_SCALE);
    setRotation([0, -15, 0]);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (isRegionalMode) {
      return;
    }

    cancelFocusAnimation();
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (isRegionalMode || !dragStartRef.current) {
      return;
    }

    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;

    setRotation(([longitude, latitude, gamma]) => [
      longitude + deltaX * DRAG_LONGITUDE_SENSITIVITY,
      clampLatitude(latitude - deltaY * DRAG_LATITUDE_SENSITIVITY),
      gamma,
    ]);

    dragStartRef.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp() {
    setIsDragging(false);
    dragStartRef.current = null;
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (isRegionalMode) {
      return;
    }

    event.preventDefault();
    cancelFocusAnimation();
    applyScaleDelta(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  }

  function handleSelectRegion(region: SelectedRegion) {
    setSelectedCountryLabel(region.regionName);
    setSelectedMarkerCoordinates(region.coordinates);
    onSelectRegion(region);
  }

  function handleSelectCountryFromMap(countryName: string, countryCode: string, centroid: [number, number]) {
    setMapMode("globe");
    setSelectedCountryLabel(countryName);
    setSelectedMarkerCoordinates(centroid);
    setSelectedCountryCoordinates(centroid);
    focusCountry(centroid, countryCode);
    onSelectCountry({ code: countryCode, name: countryName, coordinates: centroid });
  }

  function handleCountryKeyDown(
    event: ReactKeyboardEvent<SVGPathElement>,
    countryName: string,
    countryCode: string,
    centroid: [number, number],
  ) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleSelectCountryFromMap(countryName, countryCode, centroid);
  }

  function handleOpenRegionalDetail(event: ReactMouseEvent<HTMLElement>) {
    event.stopPropagation();

    if (adminBoundaryStatus !== "success") {
      return;
    }

    cancelFocusAnimation();
    setMapMode("regional");
    setSelectedCountryLabel(selectedCountryName);
    setSelectedMarkerCoordinates(null);
  }

  function handleReturnToGlobe() {
    cancelFocusAnimation();
    setMapMode("globe");
    setScale(FOCUSED_SCALE);

    if (selectedCountryCode && selectedCountryName) {
      setSelectedCountryLabel(selectedCountryName);
      setSelectedMarkerCoordinates(selectedCountryCoordinates ?? selectedCountryCoordinatesFromProps);
      onSelectCountry({
        code: selectedCountryCode,
        name: selectedCountryName,
        coordinates: selectedCountryCoordinates ?? selectedCountryCoordinatesFromProps ?? undefined,
      });
    }
  }

  const visibleSelectedLabel = selectedRegionCode
    ? selectedCountryLabel
    : selectedCountryName ?? selectedCountryLabel;
  const visibleSelectedMarkerCoordinates = selectedRegionCode
    ? selectedMarkerCoordinates
    : selectedCountryCoordinatesFromProps ?? selectedMarkerCoordinates;

  return (
    <div
      className={
        isImmersive
          ? "h-full min-w-0 max-w-full overflow-hidden bg-slate-100 dark:bg-slate-950"
          : "min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
      }
      data-weather-layer={activeLayerId}
    >
      {!isImmersive ? (
      <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {hoveredCountryName ?? visibleSelectedLabel ?? "Select a country on the globe"}
        </p>
        <span className="hidden rounded-md border border-slate-200 px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:inline">
          {isRegionalMode ? "Regional Detail" : "Interactive Globe"}
        </span>
      </div>
      ) : null}

      <div
        className={`weather-map-stage relative w-full min-w-0 overflow-hidden ${
          isImmersive ? "h-full min-h-[720px] max-h-none" : "h-[56vh] min-h-[320px] max-h-[620px]"
        } ${
          isRegionalMode ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className="weather-map-aurora" aria-hidden="true" />
        <div className="weather-map-grid" aria-hidden="true" />

        {isRegionalMode && selectedCountryCode && selectedCountryName ? (
          <RegionalMap
            boundaries={boundaries}
            countryCode={selectedCountryCode}
            countryName={selectedCountryName}
            selectedRegionCode={selectedRegionCode}
            selectedLabel={selectedCountryLabel}
            selectedMarkerCoordinates={selectedRegionCode ? selectedMarkerCoordinates : null}
            statusLabel={adminBoundaryStatusLabel}
            onSelectRegion={handleSelectRegion}
            onReturnToGlobe={handleReturnToGlobe}
          />
        ) : hasMounted ? (
          <ComposableMap
            projection="geoOrthographic"
            projectionConfig={{ scale, rotate: rotation }}
            className="relative z-10 h-full w-full min-w-0 max-w-full drop-shadow-[0_22px_28px_rgba(15,23,42,0.24)]"
            aria-label="World map"
          >
            <defs>
              <radialGradient id="globeOceanGradient" cx="38%" cy="30%" r="68%">
                <stop offset="0%" stopColor="#e6eef4" />
                <stop offset="42%" stopColor="#8eb6c8" />
                <stop offset="78%" stopColor="#28677d" />
                <stop offset="100%" stopColor="#0f3d52" />
              </radialGradient>
              <radialGradient id="globeShadeGradient" cx="34%" cy="26%" r="74%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.46)" />
                <stop offset="58%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(15,23,42,0.42)" />
              </radialGradient>
            </defs>

            <Sphere
              id="globe-ocean"
              fill="url(#globeOceanGradient)"
              stroke="rgba(226,232,240,0.84)"
              strokeWidth={0.8}
            />
            <Graticule stroke="rgba(248,250,252,0.28)" strokeWidth={0.35} />

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
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${countryName}`}
                      onMouseEnter={() => setHoveredCountryName(countryName)}
                      onMouseLeave={() => setHoveredCountryName(null)}
                      onClick={() => handleSelectCountryFromMap(countryName, countryCode, centroid)}
                      onKeyDown={(event) => handleCountryKeyDown(event, countryName, countryCode, centroid)}
                      className={`transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${
                        isSelected ? "pointer-events-none" : "cursor-pointer"
                      }`}
                      style={{
                        default: {
                          fill: isSelected ? "rgba(245, 158, 11, 0.18)" : defaultFill,
                          stroke: isSelected ? "#111827" : "rgba(17, 24, 39, 0.56)",
                          strokeWidth: isSelected ? 1.8 : 0.75,
                        },
                        hover: {
                          fill: "#d9b46f",
                          stroke: "#0f172a",
                          strokeWidth: 1.1,
                        },
                        pressed: {
                          fill: "#b45309",
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

            {visibleSelectedMarkerCoordinates && selectedWeatherCondition ? (
              <WeatherConditionMarker condition={selectedWeatherCondition} coordinates={visibleSelectedMarkerCoordinates} />
            ) : null}

            {selectedCountryCode && visibleSelectedMarkerCoordinates ? (
              <Marker coordinates={visibleSelectedMarkerCoordinates}>
                <g className="weather-country-popout-anchor" style={{ pointerEvents: "all" }}>
                  <line x1="0" y1="-6" x2="0" y2="-36" className="weather-country-popout-line pointer-events-none" />
                  <circle cx="0" cy="-4" r="3.2" className="weather-country-popout-dot pointer-events-none" />
                  <foreignObject
                    x="-122"
                    y="-98"
                    width="244"
                    height="66"
                    className="overflow-visible"
                    style={{ pointerEvents: "all" }}
                  >
                    <div
                      className="weather-country-popout"
                      onMouseDown={(event) => event.stopPropagation()}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={canShowDetailButton ? handleOpenRegionalDetail : undefined}
                    >
                      <span>{visibleSelectedLabel}</span>
                      {canShowDetailButton ? (
                        <button
                          type="button"
                          onMouseDown={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={handleOpenRegionalDetail}
                          className="weather-country-detail-button"
                          aria-label={`${visibleSelectedLabel} regional detail`}
                        >
                          Detail
                        </button>
                      ) : null}
                    </div>
                  </foreignObject>
                </g>
              </Marker>
            ) : null}
          </ComposableMap>
        ) : (
          <div aria-hidden="true" className="relative z-10 h-full w-full">
            <div className="absolute left-1/2 top-1/2 h-[min(72vw,480px)] w-[min(72vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-[radial-gradient(circle_at_38%_30%,#e6eef4_0%,#8eb6c8_42%,#28677d_78%,#0f3d52_100%)] shadow-[0_22px_28px_rgba(15,23,42,0.24)] dark:border-slate-700" />
          </div>
        )}

        {!isRegionalMode ? (
          <div className={`absolute right-3 z-20 flex gap-2 ${isImmersive ? "top-48 md:top-24" : "top-3"}`}>
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 font-mono text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 font-mono text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              -
            </button>
            <button
              type="button"
              onClick={handleResetView}
              aria-label="Reset map view"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 px-3 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              Reset
            </button>
          </div>
        ) : null}

        {!isRegionalMode && adminBoundaryStatusLabel ? (
          <div
            role="status"
            className="absolute bottom-3 left-3 z-20 max-w-[calc(100%-1.5rem)] rounded-md border border-slate-200 bg-white/92 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/86 dark:text-slate-100"
          >
            {adminBoundaryStatusLabel}
          </div>
        ) : null}
      </div>

      {!isImmersive ? (
      <div className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {isRegionalMode
            ? "Select a region for local weather, or return to the globe."
            : "Drag to rotate, use +/- or wheel to zoom, and click a country for details."}
        </p>
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
      ) : null}
    </div>
  );
}
