"use client";

import { geoCentroid } from "d3-geo";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { ComposableMap, Geographies, Geography, Graticule, Marker, ZoomableGroup } from "react-simple-maps";

import { RegionalMap } from "@/components/map/regional-map";
import { WeatherConditionMarker } from "@/components/map/weather-condition-marker";
import { WeatherOverlayMarker } from "@/components/map/weather-overlay-marker";
import { useAdminBoundaries } from "@/hooks/use-admin-boundaries";
import type { AdminBoundaryLoadStatus } from "@/types/admin-boundary";
import type { MapMode } from "@/types/map-mode";
import type { WeatherCondition } from "@/types/weather";
import type { SelectedCountry, SelectedRegion, WeatherOverlayPoint } from "@/types/weather-data";

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const LAND_COLORS = ["#a7b0ba", "#b4bdc5", "#91a8b5", "#c0b29d", "#98afa2"];
const DEFAULT_CENTER: [number, number] = [0, 18];
const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const FOCUSED_ZOOM = 2.8;
const ZOOM_STEP = 0.65;

const MOCK_WEATHER_COUNTRY_CODES: Record<string, string> = {
  France: "FRA",
  Japan: "JPN",
  "South Korea": "KOR",
  "United States of America": "USA",
};

const FOCUSED_ZOOM_BY_COUNTRY_CODE: Record<string, number> = {
  FRA: 3,
  JPN: 4.8,
  KOR: 5.2,
};

type WorldMapProps = {
  activeLayerId?: string;
  selectedCountryCode: string | null;
  selectedCountryName: string | null;
  selectedCountryCoordinates: [number, number] | null;
  selectedRegionCode: string | null;
  selectedWeatherCondition: WeatherCondition | null;
  weatherOverlayPoints?: WeatherOverlayPoint[];
  isWeatherOverlayVisible?: boolean;
  weatherOverlayStatusLabel?: string | null;
  variant?: "panel" | "immersive";
  onSelectCountry: (country: SelectedCountry) => void;
  onSelectRegion: (region: SelectedRegion) => void;
  onSelectWeatherOverlayPoint?: (point: WeatherOverlayPoint) => void;
  onToggleWeatherOverlay?: () => void;
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

type MapPosition = {
  center: [number, number];
  zoom: number;
};

type ZoomableGroupMoveEnd = {
  coordinates: [number, number];
  zoom: number;
};

function getCountryCode(feature: GeographyFeature, countryName: string) {
  return (
    feature.properties.iso_a3 ??
    feature.properties.ISO_A3 ??
    MOCK_WEATHER_COUNTRY_CODES[countryName] ??
    String(feature.id ?? feature.rsmKey)
  );
}

function clampLatitude(latitude: number) {
  return Math.max(-72, Math.min(78, latitude));
}

function clampZoom(zoom: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

function normalizeCenter([longitude, latitude]: [number, number]): [number, number] {
  return [Math.max(-180, Math.min(180, longitude)), clampLatitude(latitude)];
}

function getFocusedZoom(countryCode: string) {
  return FOCUSED_ZOOM_BY_COUNTRY_CODE[countryCode] ?? FOCUSED_ZOOM;
}

function getAdminBoundaryStatusLabel(status: AdminBoundaryLoadStatus) {
  const labelMap: Record<AdminBoundaryLoadStatus, string | null> = {
    idle: null,
    loading: "지역 경계를 불러오는 중",
    success: null,
    error: "지역 경계를 잠시 불러올 수 없습니다",
    unsupported: "이 위치는 지역 경계를 지원하지 않습니다",
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
  weatherOverlayPoints = [],
  isWeatherOverlayVisible = false,
  weatherOverlayStatusLabel = null,
  variant = "panel",
  onSelectCountry,
  onSelectRegion,
  onSelectWeatherOverlayPoint,
  onToggleWeatherOverlay,
}: WorldMapProps) {
  const hasMounted = useSyncExternalStore(
    subscribeToClientMount,
    getClientMountSnapshot,
    getServerMountSnapshot,
  );
  const { boundaries, status: adminBoundaryStatus } = useAdminBoundaries(selectedCountryCode);
  const [mapPosition, setMapPosition] = useState<MapPosition>({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [selectedCountryLabel, setSelectedCountryLabel] = useState<string | null>(null);
  const [selectedMarkerCoordinates, setSelectedMarkerCoordinates] = useState<[number, number] | null>(null);
  const [selectedCountryCoordinates, setSelectedCountryCoordinates] = useState<[number, number] | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>("world");
  const adminBoundaryStatusLabel = getAdminBoundaryStatusLabel(adminBoundaryStatus);
  const isRegionalMode = mapMode === "regional" && Boolean(selectedCountryCode && selectedCountryName);
  const canShowDetailButton = mapMode === "world" && adminBoundaryStatus === "success";
  const isImmersive = variant === "immersive";

  const applyZoomDelta = useCallback((delta: number) => {
    setMapPosition((currentPosition) => ({
      ...currentPosition,
      zoom: clampZoom(currentPosition.zoom + delta),
    }));
  }, []);

  const focusCoordinates = useCallback((coordinates: [number, number], targetZoom: number) => {
    setMapPosition({
      center: normalizeCenter(coordinates),
      zoom: clampZoom(targetZoom),
    });
  }, []);

  const focusCountry = useCallback(
    (centroid: [number, number], countryCode: string) => {
      focusCoordinates(centroid, getFocusedZoom(countryCode));
    },
    [focusCoordinates],
  );

  useEffect(() => {
    if (!selectedCountryCode || !selectedCountryName || !selectedCountryCoordinatesFromProps) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      setMapMode("world");
      focusCountry(selectedCountryCoordinatesFromProps, selectedCountryCode);
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [focusCountry, selectedCountryCode, selectedCountryCoordinatesFromProps, selectedCountryName]);

  function handleZoomIn() {
    applyZoomDelta(ZOOM_STEP);
  }

  function handleZoomOut() {
    applyZoomDelta(-ZOOM_STEP);
  }

  function handleResetView() {
    setMapMode("world");
    setMapPosition({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });
  }

  function handleMoveEnd(position: ZoomableGroupMoveEnd) {
    setMapPosition({
      center: normalizeCenter(position.coordinates),
      zoom: clampZoom(position.zoom),
    });
  }

  function handleSelectRegion(region: SelectedRegion) {
    setSelectedCountryLabel(region.regionName);
    setSelectedMarkerCoordinates(region.coordinates);
    onSelectRegion(region);
  }

  function handleSelectCountryFromMap(countryName: string, countryCode: string, centroid: [number, number]) {
    setMapMode("world");
    setSelectedCountryLabel(countryName);
    setSelectedMarkerCoordinates(centroid);
    setSelectedCountryCoordinates(centroid);
    focusCountry(centroid, countryCode);
    onSelectCountry({ code: countryCode, name: countryName, coordinates: centroid });
  }

  function handleSelectWeatherOverlayPoint(point: WeatherOverlayPoint) {
    setMapMode("world");
    setSelectedCountryLabel(point.countryName);
    setSelectedMarkerCoordinates([point.longitude, point.latitude]);
    setSelectedCountryCoordinates([point.longitude, point.latitude]);
    focusCountry([point.longitude, point.latitude], point.countryCode);

    if (onSelectWeatherOverlayPoint) {
      onSelectWeatherOverlayPoint(point);
      return;
    }

    onSelectCountry({
      code: point.countryCode,
      name: point.countryName,
      coordinates: [point.longitude, point.latitude],
    });
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

    setMapMode("regional");
    setSelectedCountryLabel(selectedCountryName);
    setSelectedMarkerCoordinates(null);
  }

  function handleReturnToWorldMap() {
    setMapMode("world");
    setMapPosition((currentPosition) => ({
      ...currentPosition,
      zoom: Math.max(currentPosition.zoom, FOCUSED_ZOOM),
    }));

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
  const canShowSelectedMarker = visibleSelectedMarkerCoordinates !== null;

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
            {hoveredCountryName ?? visibleSelectedLabel ?? "지도에서 국가를 선택하세요"}
          </p>
          <span className="hidden rounded-md border border-slate-200 px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:inline">
            {isRegionalMode ? "Regional Detail" : "Live Weather Map"}
          </span>
        </div>
      ) : null}

      <div
        className={`weather-map-stage relative w-full min-w-0 overflow-hidden ${
          isImmersive ? "h-full min-h-[720px] max-h-none" : "h-[56vh] min-h-[320px] max-h-[620px]"
        } ${isRegionalMode ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
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
            onReturnToWorldMap={handleReturnToWorldMap}
          />
        ) : hasMounted ? (
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 140 }}
            className="relative z-10 h-full w-full min-w-0 max-w-full drop-shadow-[0_16px_18px_rgba(15,23,42,0.16)]"
            aria-label="Live weather world map"
          >
            <defs>
              <linearGradient id="mapOceanWash" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(226, 246, 255, 0.46)" />
                <stop offset="52%" stopColor="rgba(255, 255, 255, 0.18)" />
                <stop offset="100%" stopColor="rgba(8, 145, 178, 0.18)" />
              </linearGradient>
            </defs>
            <rect width="800" height="600" fill="url(#mapOceanWash)" />

            <ZoomableGroup
              center={mapPosition.center}
              zoom={mapPosition.zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              onMoveEnd={handleMoveEnd}
            >
              <Graticule stroke="rgba(15,23,42,0.12)" strokeWidth={0.45} />

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
                            fill: isSelected ? "rgba(245, 158, 11, 0.26)" : defaultFill,
                            stroke: isSelected ? "#111827" : "rgba(17, 24, 39, 0.46)",
                            strokeWidth: isSelected ? 1.4 : 0.55,
                          },
                          hover: {
                            fill: "#d9b46f",
                            stroke: "#0f172a",
                            strokeWidth: 0.9,
                          },
                          pressed: {
                            fill: "#b45309",
                            stroke: "#0f172a",
                            strokeWidth: 1,
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {isWeatherOverlayVisible
                ? weatherOverlayPoints.map((point) => (
                    <WeatherOverlayMarker key={point.id} point={point} onSelectPoint={handleSelectWeatherOverlayPoint} />
                  ))
                : null}

              {canShowSelectedMarker && visibleSelectedMarkerCoordinates && selectedWeatherCondition ? (
                <WeatherConditionMarker condition={selectedWeatherCondition} coordinates={visibleSelectedMarkerCoordinates} />
              ) : null}

              {selectedCountryCode && canShowSelectedMarker && visibleSelectedMarkerCoordinates ? (
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
                            aria-label={`${visibleSelectedLabel} 지역 상세 보기`}
                          >
                            Detail
                          </button>
                        ) : null}
                      </div>
                    </foreignObject>
                  </g>
                </Marker>
              ) : null}
            </ZoomableGroup>
          </ComposableMap>
        ) : (
          <div aria-hidden="true" className="relative z-10 h-full w-full">
            <div className="absolute inset-10 rounded-md border border-slate-200 bg-white/30 shadow-[0_16px_18px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900/30" />
          </div>
        )}

        {!isRegionalMode && onToggleWeatherOverlay ? (
          <div className={`absolute right-3 z-20 ${isImmersive ? "top-48 md:top-24" : "top-3"}`}>
            <button
              type="button"
              onClick={onToggleWeatherOverlay}
              aria-pressed={isWeatherOverlayVisible}
              aria-label={isWeatherOverlayVisible ? "날씨 오버레이 숨기기" : "날씨 오버레이 보이기"}
              className={`inline-flex h-10 items-center justify-center rounded-md border px-3 text-xs font-semibold shadow-sm backdrop-blur transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${
                isWeatherOverlayVisible
                  ? "border-cyan-500/70 bg-cyan-950/88 text-cyan-50 hover:bg-cyan-900 dark:border-cyan-300/50 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                  : "border-slate-200 bg-white/92 text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              Weather
            </button>
          </div>
        ) : null}

        {!isRegionalMode ? (
          <div
            className={`absolute left-3 z-20 flex flex-wrap gap-2 md:left-4 ${
              isImmersive ? "top-48 md:top-[31rem]" : "top-3"
            }`}
          >
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="지도 확대"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 font-mono text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="지도 축소"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 font-mono text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              -
            </button>
            <button
              type="button"
              onClick={handleResetView}
              aria-label="지도 초기화"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 px-3 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              Reset
            </button>
            {weatherOverlayStatusLabel ? (
              <div
                role="status"
                className="min-h-10 rounded-md border border-slate-200 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100"
              >
                {weatherOverlayStatusLabel}
              </div>
            ) : null}
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
              ? "지역을 선택해 세부 날씨를 보거나 세계지도로 돌아갈 수 있습니다."
              : "드래그로 지도를 이동하고, 휠 또는 +/- 버튼으로 확대/축소할 수 있습니다."}
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
