"use client";

import { geoCentroid } from "d3-geo";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
import type { WeatherLayerId } from "@/types/weather-layer";
import type { SelectedCountry, SelectedRegion, WeatherOverlayPoint } from "@/types/weather-data";

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const LAND_COLORS = ["#a7b0ba", "#b4bdc5", "#91a8b5", "#c0b29d", "#98afa2"];
const DEFAULT_CENTER: [number, number] = [127.139, 37.482];
const DEFAULT_ZOOM = 5;
const MIN_ZOOM = 1.65;
const MAX_ZOOM = 8;
const FOCUSED_ZOOM = 2.8;
const USER_LOCATION_ZOOM = 5.2;
const ZOOM_STEP = 0.65;
const WORLD_REPEAT_OFFSETS = [-880, 0, 880];
const COMPACT_OVERLAY_ZOOM_THRESHOLD = 2.2;
const MOBILE_VISIBLE_OVERLAY_COUNT = 4;

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
  activeLayerId?: WeatherLayerId;
  selectedCountryCode: string | null;
  selectedCountryName: string | null;
  selectedCountryCoordinates: [number, number] | null;
  selectedRegionCode: string | null;
  selectedWeatherCondition: WeatherCondition | null;
  weatherOverlayPoints?: WeatherOverlayPoint[];
  isWeatherOverlayVisible?: boolean;
  isWeatherOverlayLoading?: boolean;
  weatherOverlayStatusLabel?: string | null;
  variant?: "panel" | "immersive";
  onSelectCountry: (country: SelectedCountry) => void;
  onSelectRegion: (region: SelectedRegion) => void;
  onSelectWeatherOverlayPoint?: (point: WeatherOverlayPoint) => void;
  onRefreshWeatherOverlay?: () => void;
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

type UserLocationStatus = "idle" | "locating" | "success" | "unsupported" | "denied" | "error";

type ZoomableGroupMoveEnd = {
  coordinates: [number, number];
  zoom: number;
};

type WeatherHeatPoint = {
  point: WeatherOverlayPoint;
  color: string;
  opacity: number;
  radius: number;
};

type DeepLinkCamera = {
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

function wrapLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function normalizeCenter([longitude, latitude]: [number, number]): [number, number] {
  return [wrapLongitude(longitude), clampLatitude(latitude)];
}

function getFocusedZoom(countryCode: string) {
  return FOCUSED_ZOOM_BY_COUNTRY_CODE[countryCode] ?? FOCUSED_ZOOM;
}

function getAdminBoundaryStatusLabel(status: AdminBoundaryLoadStatus) {
  const labelMap: Record<AdminBoundaryLoadStatus, string | null> = {
    idle: null,
    loading: "Loading regional boundaries...",
    success: null,
    error: "Regional boundaries could not be loaded.",
    unsupported: "Regional boundaries are not available for this location.",
  };

  return labelMap[status];
}

function getUserLocationStatusLabel(status: UserLocationStatus) {
  const labelMap: Record<UserLocationStatus, string | null> = {
    idle: null,
    locating: "Locating your position...",
    success: "Map focused on your location.",
    unsupported: "Location is not supported in this browser.",
    denied: "Location permission was denied.",
    error: "Location could not be detected.",
  };

  return labelMap[status];
}

function clampRatio(value: number) {
  return Math.max(0, Math.min(1, value));
}

function isFiniteCoordinate(value: number) {
  return Number.isFinite(value);
}

function isValidLatitude(latitude: number) {
  return isFiniteCoordinate(latitude) && latitude >= -90 && latitude <= 90;
}

function isValidLongitude(longitude: number) {
  return isFiniteCoordinate(longitude) && longitude >= -180 && longitude <= 180;
}

function parseFiniteNumber(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getDeepLinkCameraFromValues(latitude: number | null, longitude: number | null, zoom: number | null) {
  if (latitude === null || longitude === null || !isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return null;
  }

  return {
    coordinates: [longitude, latitude] as [number, number],
    zoom: clampZoom(zoom ?? USER_LOCATION_ZOOM),
  };
}

function parseMapCameraFromSearch(search: string): DeepLinkCamera | null {
  if (!search) {
    return null;
  }

  const searchParams = new URLSearchParams(search);
  const explicitCamera = getDeepLinkCameraFromValues(
    parseFiniteNumber(searchParams.get("lat") ?? searchParams.get("latitude")),
    parseFiniteNumber(searchParams.get("lon") ?? searchParams.get("lng") ?? searchParams.get("longitude")),
    parseFiniteNumber(searchParams.get("zoom") ?? searchParams.get("z")),
  );

  if (explicitCamera) {
    return explicitCamera;
  }

  const rawQuery = search.replace(/^\?/, "");
  const [latitudeValue, longitudeValue, zoomValue] = rawQuery.split(",").map((value) => value.trim());

  return getDeepLinkCameraFromValues(
    parseFiniteNumber(latitudeValue),
    parseFiniteNumber(longitudeValue),
    parseFiniteNumber(zoomValue),
  );
}

function normalizeLayerValue(value: number, min: number, max: number) {
  return clampRatio((value - min) / (max - min));
}

function getConditionPrecipitationEstimate(condition: WeatherCondition) {
  const estimateMap: Record<WeatherCondition, number> = {
    sunny: 0,
    cloudy: 0.2,
    foggy: 0.1,
    rainy: 4,
    stormy: 14,
    snowy: 1.8,
    unknown: 0,
  };

  return estimateMap[condition];
}

function getConditionCloudEstimate(condition: WeatherCondition) {
  const estimateMap: Record<WeatherCondition, number> = {
    sunny: 8,
    cloudy: 72,
    foggy: 86,
    rainy: 88,
    stormy: 94,
    snowy: 82,
    unknown: 46,
  };

  return estimateMap[condition];
}

function getWeatherLayerRatio(point: WeatherOverlayPoint, activeLayerId: WeatherLayerId) {
  switch (activeLayerId) {
    case "temperature":
      return normalizeLayerValue(point.temperature, -10, 40);
    case "feels-like":
      return normalizeLayerValue(point.feelsLike ?? point.temperature, -10, 42);
    case "precipitation":
    case "radar":
      return normalizeLayerValue(
        point.precipitationMm ?? getConditionPrecipitationEstimate(point.condition),
        0,
        activeLayerId === "radar" ? 18 : 10,
      );
    case "wind":
      return normalizeLayerValue(point.windSpeed ?? 0, 0, 18);
    case "clouds":
      return normalizeLayerValue(getConditionCloudEstimate(point.condition), 0, 100);
    case "pressure":
      return normalizeLayerValue(1013 + (point.temperature - 18) * 0.7 - (point.windSpeed ?? 0), 990, 1040);
    case "humidity":
      return normalizeLayerValue(point.humidity ?? 55, 10, 100);
    default:
      return 0.5;
  }
}

function getWeatherLayerColor(activeLayerId: WeatherLayerId, ratio: number) {
  const paletteMap: Record<WeatherLayerId, string[]> = {
    temperature: ["#2563eb", "#22c55e", "#facc15", "#f97316", "#b91c1c"],
    "feels-like": ["#312e81", "#0ea5e9", "#22c55e", "#f59e0b", "#be123c"],
    precipitation: ["#f8fafc", "#a7f3d0", "#0891b2", "#2563eb", "#7e22ce"],
    radar: ["#dbeafe", "#38bdf8", "#22c55e", "#facc15", "#e11d48"],
    wind: ["#f8fafc", "#99f6e4", "#14b8a6", "#2563eb", "#111827"],
    clouds: ["#f8fafc", "#e2e8f0", "#cbd5e1", "#94a3b8", "#334155"],
    pressure: ["#1d4ed8", "#60a5fa", "#f8fafc", "#f97316", "#b91c1c"],
    humidity: ["#f8fafc", "#ccfbf1", "#5eead4", "#0891b2", "#164e63"],
  };
  const palette = paletteMap[activeLayerId];
  const index = Math.min(palette.length - 1, Math.floor(clampRatio(ratio) * palette.length));

  return palette[index];
}

function getWeatherHeatPoints(points: WeatherOverlayPoint[], activeLayerId: WeatherLayerId) {
  return points.map((point) => {
    const ratio = getWeatherLayerRatio(point, activeLayerId);

    return {
      point,
      color: getWeatherLayerColor(activeLayerId, ratio),
      opacity: 0.18 + ratio * 0.34,
      radius: 56 + ratio * 74,
    };
  });
}

function WeatherHeatLayer({
  activeLayerId,
  points,
}: {
  activeLayerId: WeatherLayerId;
  points: WeatherOverlayPoint[];
}) {
  const heatPoints = getWeatherHeatPoints(points, activeLayerId);

  if (heatPoints.length === 0) {
    return null;
  }

  return (
    <g className="weather-heat-layer" aria-hidden="true" style={{ pointerEvents: "none" }}>
      {heatPoints.map((heatPoint: WeatherHeatPoint) => (
        <Marker key={`${activeLayerId}-${heatPoint.point.id}`} coordinates={[heatPoint.point.longitude, heatPoint.point.latitude]}>
          <circle
            r={heatPoint.radius}
            fill={heatPoint.color}
            opacity={heatPoint.opacity}
            className="weather-heat-layer-spot"
          />
          <circle
            r={heatPoint.radius * 0.48}
            fill={heatPoint.color}
            opacity={Math.min(0.72, heatPoint.opacity + 0.2)}
            className="weather-heat-layer-core"
          />
        </Marker>
      ))}
    </g>
  );
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

function subscribeToCompactViewport(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia("(max-width: 767px)");
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getCompactViewportSnapshot() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

function getServerCompactViewportSnapshot() {
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
  isWeatherOverlayLoading = false,
  weatherOverlayStatusLabel = null,
  variant = "panel",
  onSelectCountry,
  onSelectRegion,
  onSelectWeatherOverlayPoint,
  onRefreshWeatherOverlay,
  onToggleWeatherOverlay,
}: WorldMapProps) {
  const hasMounted = useSyncExternalStore(
    subscribeToClientMount,
    getClientMountSnapshot,
    getServerMountSnapshot,
  );
  const isCompactViewport = useSyncExternalStore(
    subscribeToCompactViewport,
    getCompactViewportSnapshot,
    getServerCompactViewportSnapshot,
  );
  const { boundaries, status: adminBoundaryStatus } = useAdminBoundaries(selectedCountryCode);
  const hasAppliedDeepLinkCameraRef = useRef(false);
  const hasRequestedUserLocationRef = useRef(false);
  const [mapPosition, setMapPosition] = useState<MapPosition>({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });
  const [userLocationStatus, setUserLocationStatus] = useState<UserLocationStatus>("idle");
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [selectedCountryLabel, setSelectedCountryLabel] = useState<string | null>(null);
  const [selectedMarkerCoordinates, setSelectedMarkerCoordinates] = useState<[number, number] | null>(null);
  const [selectedCountryCoordinates, setSelectedCountryCoordinates] = useState<[number, number] | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>("world");
  const adminBoundaryStatusLabel = getAdminBoundaryStatusLabel(adminBoundaryStatus);
  const userLocationStatusLabel = getUserLocationStatusLabel(userLocationStatus);
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

  const requestUserLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setUserLocationStatus("unsupported");
      return;
    }

    setUserLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        focusCoordinates(
          [position.coords.longitude, position.coords.latitude],
          USER_LOCATION_ZOOM,
        );
        setMapMode("world");
        setUserLocationStatus("success");
      },
      (error) => {
        setUserLocationStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      {
        enableHighAccuracy: false,
        maximumAge: 1000 * 60 * 10,
        timeout: 8000,
      },
    );
  }, [focusCoordinates]);

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

  useEffect(() => {
    if (!hasMounted || hasAppliedDeepLinkCameraRef.current) {
      return;
    }

    const deepLinkCamera = parseMapCameraFromSearch(window.location.search);

    if (!deepLinkCamera) {
      return;
    }

    hasAppliedDeepLinkCameraRef.current = true;
    const focusFrame = window.requestAnimationFrame(() => {
      setMapMode("world");
      focusCoordinates(deepLinkCamera.coordinates, deepLinkCamera.zoom);
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [focusCoordinates, hasMounted]);

  useEffect(() => {
    if (!hasMounted || hasRequestedUserLocationRef.current) {
      return;
    }

    if (hasAppliedDeepLinkCameraRef.current) {
      return;
    }

    hasRequestedUserLocationRef.current = true;
    requestUserLocation();
  }, [hasMounted, requestUserLocation]);

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
  const shouldLimitOverlayMarkers =
    isCompactViewport && mapPosition.zoom < COMPACT_OVERLAY_ZOOM_THRESHOLD;
  const visibleWeatherOverlayPoints = shouldLimitOverlayMarkers
    ? weatherOverlayPoints.slice(0, MOBILE_VISIBLE_OVERLAY_COUNT)
    : weatherOverlayPoints;
  const compactOverlayStatusLabel =
    isWeatherOverlayVisible && shouldLimitOverlayMarkers && weatherOverlayPoints.length > visibleWeatherOverlayPoints.length
      ? `Compact mobile overlay: ${visibleWeatherOverlayPoints.length}/${weatherOverlayPoints.length} points`
      : null;
  const visibleWeatherOverlayStatusLabel = [weatherOverlayStatusLabel, compactOverlayStatusLabel]
    .filter(Boolean)
    .join(" / ");

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
            {hoveredCountryName ?? visibleSelectedLabel ?? "Select a country on the map"}
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
              {WORLD_REPEAT_OFFSETS.map((offsetX) => {
                const isWrappedCopy = offsetX !== 0;

                return (
                  <g
                    key={offsetX}
                    transform={`translate(${offsetX} 0)`}
                    aria-hidden={isWrappedCopy}
                    style={{ pointerEvents: isWrappedCopy ? "none" : "auto" }}
                  >
                    <Graticule stroke="rgba(15,23,42,0.12)" strokeWidth={0.45} />

                    <Geographies geography={WORLD_GEO_URL}>
                      {({ geographies }) =>
                        geographies.map((geography, index) => {
                          const feature = geography as GeographyFeature;
                          const countryName = feature.properties.name ?? feature.properties.NAME ?? "Unknown";
                          const countryCode = getCountryCode(feature, countryName);
                          const isSelected = !isWrappedCopy && selectedCountryCode === countryCode;
                          const centroid = geoCentroid(feature as never) as [number, number];
                          const defaultFill = LAND_COLORS[index % LAND_COLORS.length];

                          return (
                            <Geography
                              key={`${offsetX}-${feature.rsmKey}`}
                              geography={geography}
                              role={isWrappedCopy ? undefined : "button"}
                              tabIndex={isWrappedCopy ? undefined : 0}
                              aria-label={isWrappedCopy ? undefined : `Select ${countryName}`}
                              onMouseEnter={isWrappedCopy ? undefined : () => setHoveredCountryName(countryName)}
                              onMouseLeave={isWrappedCopy ? undefined : () => setHoveredCountryName(null)}
                              onClick={
                                isWrappedCopy
                                  ? undefined
                                  : () => handleSelectCountryFromMap(countryName, countryCode, centroid)
                              }
                              onKeyDown={
                                isWrappedCopy
                                  ? undefined
                                  : (event) => handleCountryKeyDown(event, countryName, countryCode, centroid)
                              }
                              className={`transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${
                                isSelected || isWrappedCopy ? "pointer-events-none" : "cursor-pointer"
                              }`}
                              style={{
                                default: {
                                  fill: isSelected ? "rgba(245, 158, 11, 0.26)" : defaultFill,
                                  stroke: isSelected ? "#111827" : "rgba(17, 24, 39, 0.46)",
                                  strokeWidth: isSelected ? 1.4 : 0.55,
                                },
                                hover: {
                                  fill: isWrappedCopy ? defaultFill : "#d9b46f",
                                  stroke: isWrappedCopy ? "rgba(17, 24, 39, 0.46)" : "#0f172a",
                                  strokeWidth: isWrappedCopy ? 0.55 : 0.9,
                                },
                                pressed: {
                                  fill: isWrappedCopy ? defaultFill : "#b45309",
                                  stroke: isWrappedCopy ? "rgba(17, 24, 39, 0.46)" : "#0f172a",
                                  strokeWidth: isWrappedCopy ? 0.55 : 1,
                                },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </g>
                );
              })}

              {isWeatherOverlayVisible
                ? WORLD_REPEAT_OFFSETS.map((offsetX) => {
                    const isWrappedCopy = offsetX !== 0;

                    return (
                      <g
                        key={`weather-overlay-${offsetX}`}
                        transform={`translate(${offsetX} 0)`}
                        aria-hidden={isWrappedCopy}
                        style={{ pointerEvents: isWrappedCopy ? "none" : "auto" }}
                      >
                        <WeatherHeatLayer activeLayerId={activeLayerId} points={visibleWeatherOverlayPoints} />
                        {visibleWeatherOverlayPoints.map((point) => (
                          <WeatherOverlayMarker
                            key={`${offsetX}-${point.id}`}
                            point={point}
                            visualOnly={isWrappedCopy}
                            onSelectPoint={handleSelectWeatherOverlayPoint}
                          />
                        ))}
                      </g>
                    );
                  })
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
            </ZoomableGroup>
          </ComposableMap>
        ) : (
          <div aria-hidden="true" className="relative z-10 h-full w-full">
            <div className="absolute inset-10 rounded-md border border-slate-200 bg-white/30 shadow-[0_16px_18px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900/30" />
          </div>
        )}

        {!isRegionalMode && onToggleWeatherOverlay ? (
          <div className={`absolute right-3 z-20 flex flex-wrap justify-end gap-2 ${isImmersive ? "top-48 md:top-24" : "top-3"}`}>
            <button
              type="button"
              onClick={onToggleWeatherOverlay}
              aria-pressed={isWeatherOverlayVisible}
              aria-label={isWeatherOverlayVisible ? "Hide weather overlay" : "Show weather overlay"}
              className={`inline-flex h-10 items-center justify-center rounded-md border px-3 text-xs font-semibold shadow-sm backdrop-blur transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${
                isWeatherOverlayVisible
                  ? "border-cyan-500/70 bg-cyan-950/88 text-cyan-50 hover:bg-cyan-900 dark:border-cyan-300/50 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                  : "border-slate-200 bg-white/92 text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              Weather
            </button>
            {onRefreshWeatherOverlay ? (
              <button
                type="button"
                onClick={onRefreshWeatherOverlay}
                disabled={isWeatherOverlayLoading}
                aria-label="Refresh realtime weather overlay"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 px-3 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {isWeatherOverlayLoading ? "Refreshing" : "Refresh"}
              </button>
            ) : null}
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
              aria-label="Zoom map in"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 font-mono text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom map out"
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
            <button
              type="button"
              onClick={requestUserLocation}
              disabled={userLocationStatus === "locating"}
              aria-label="Focus map on my location"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 px-3 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              {userLocationStatus === "locating" ? "Locating" : "Locate"}
            </button>
            {visibleWeatherOverlayStatusLabel ? (
              <div
                role="status"
                className="min-h-10 rounded-md border border-slate-200 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100"
              >
                {visibleWeatherOverlayStatusLabel}
              </div>
            ) : null}
            {userLocationStatusLabel ? (
              <div
                role="status"
                className="min-h-10 rounded-md border border-slate-200 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100"
              >
                {userLocationStatusLabel}
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
              ? "Select a region to inspect local weather, or return to the world map."
              : "Drag the map to move, or use the +/- buttons to zoom."}
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
