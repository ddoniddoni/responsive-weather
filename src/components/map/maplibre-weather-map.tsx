"use client";

import maplibregl, {
  type GeoJSONSource,
  type LngLatBoundsLike,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
  type Map as MapLibreMap,
  type StyleSpecification,
} from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";

import type { WeatherLayerId } from "@/types/weather-layer";
import type { SelectedCountry, WeatherOverlayPoint } from "@/types/weather-data";

const DEFAULT_CENTER: [number, number] = [127.335, 35.815];
const DEFAULT_ZOOM = 3.6;
const MIN_ZOOM = 2.8;
const MAX_ZOOM = 7.5;
const WEATHER_MAP_BOUNDS: LngLatBoundsLike = [
  [-180, -58],
  [180, 82],
];
const WEATHER_SOURCE_ID = "weather-overlay-points";
const SELECTED_SOURCE_ID = "selected-weather-location";
const WEATHER_HEAT_LAYER_ID = "weather-heat-layer";
const WEATHER_DOT_LAYER_ID = "weather-point-dot-layer";
const WEATHER_HIT_LAYER_ID = "weather-point-hit-layer";
const SELECTED_DOT_LAYER_ID = "selected-weather-dot-layer";
const BASEMAP_TILE_URLS = [
  "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
  "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
  "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
];
const FALLBACK_WORLD_TILES = Array.from({ length: 8 }, (_, index) => {
  const x = index % 4;
  const y = Math.floor(index / 4) + 1;

  return {
    id: `2-${x}-${y}`,
    x,
    y: y - 1,
    src: `https://a.basemaps.cartocdn.com/rastertiles/voyager/2/${x}/${y}@2x.png`,
  };
});

type MapLibreWeatherMapProps = {
  activeLayerId?: WeatherLayerId;
  selectedCountryCode: string | null;
  selectedCountryName: string | null;
  selectedCountryCoordinates: [number, number] | null;
  weatherOverlayPoints?: WeatherOverlayPoint[];
  isWeatherOverlayVisible?: boolean;
  isWeatherOverlayLoading?: boolean;
  weatherOverlayStatusLabel?: string | null;
  onSelectCountry: (country: SelectedCountry) => void;
  onSelectWeatherOverlayPoint?: (point: WeatherOverlayPoint) => void;
  onRefreshWeatherOverlay?: () => void;
  onToggleWeatherOverlay?: () => void;
};

type OverlayFeatureProperties = {
  id: string;
  countryCode: string;
  countryName: string;
  label: string;
  temperature: number;
  condition: string;
  value: number;
};

type OverlayFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Point, OverlayFeatureProperties>;

type SelectedFeatureProperties = {
  label: string;
};

type SelectedFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Point, SelectedFeatureProperties>;

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: BASEMAP_TILE_URLS,
      tileSize: 512,
      bounds: [-180, -85, 180, 85],
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    },
  },
  layers: [
    {
      id: "carto-raster",
      type: "raster",
      source: "carto",
      paint: {
        "raster-saturation": 0.18,
        "raster-contrast": 0.32,
        "raster-brightness-min": 0,
        "raster-brightness-max": 0.96,
      },
    },
  ],
};

function clampRatio(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizeLayerValue(value: number, min: number, max: number) {
  return clampRatio((value - min) / (max - min));
}

function getConditionPrecipitationEstimate(condition: WeatherOverlayPoint["condition"]) {
  const estimateMap: Record<WeatherOverlayPoint["condition"], number> = {
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

function getConditionCloudEstimate(condition: WeatherOverlayPoint["condition"]) {
  const estimateMap: Record<WeatherOverlayPoint["condition"], number> = {
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

function getWeatherLayerValue(point: WeatherOverlayPoint, activeLayerId: WeatherLayerId) {
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

function buildWeatherFeatureCollection(
  points: WeatherOverlayPoint[],
  activeLayerId: WeatherLayerId,
): OverlayFeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        id: point.id,
        countryCode: point.countryCode,
        countryName: point.countryName,
        label: point.label,
        temperature: point.temperature,
        condition: point.condition,
        value: getWeatherLayerValue(point, activeLayerId),
      },
    })),
  };
}

function buildSelectedFeatureCollection(
  coordinates: [number, number] | null,
  label: string | null,
): SelectedFeatureCollection {
  return {
    type: "FeatureCollection",
    features: coordinates
      ? [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates,
            },
            properties: {
              label: label ?? "Selected location",
            },
          },
        ]
      : [],
  };
}

function getFeaturePointId(feature: MapGeoJSONFeature) {
  const id = feature.properties?.id;

  return typeof id === "string" ? id : null;
}

function setOverlayLayerVisibility(map: MapLibreMap, isVisible: boolean) {
  const visibility = isVisible ? "visible" : "none";

  [WEATHER_HEAT_LAYER_ID, WEATHER_DOT_LAYER_ID, WEATHER_HIT_LAYER_ID].forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
  });
}

function configureMapInteractions(map: MapLibreMap) {
  map.dragPan.enable();
  map.scrollZoom.enable();
  map.touchZoomRotate.enable();
  map.keyboard.enable();
  map.boxZoom.enable();
  map.doubleClickZoom.enable();
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
}

function addWeatherLayers(map: MapLibreMap) {
  if (!map.getSource(WEATHER_SOURCE_ID)) {
    map.addSource(WEATHER_SOURCE_ID, {
      type: "geojson",
      data: buildWeatherFeatureCollection([], "temperature"),
    });
  }

  if (!map.getSource(SELECTED_SOURCE_ID)) {
    map.addSource(SELECTED_SOURCE_ID, {
      type: "geojson",
      data: buildSelectedFeatureCollection(null, null),
    });
  }

  if (!map.getLayer(WEATHER_HEAT_LAYER_ID)) {
    map.addLayer({
      id: WEATHER_HEAT_LAYER_ID,
      type: "heatmap",
      source: WEATHER_SOURCE_ID,
      maxzoom: 9,
      paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["get", "value"], 0, 0.06, 1, 0.7],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 2, 0.52, 8, 1.08],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 2, 14, 6, 32, 9, 48],
        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0.42, 8, 0.22],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(14, 165, 233, 0)",
          0.18,
          "rgba(14, 165, 233, 0.18)",
          0.36,
          "rgba(34, 197, 94, 0.24)",
          0.58,
          "rgba(250, 204, 21, 0.3)",
          0.78,
          "rgba(249, 115, 22, 0.34)",
          1,
          "rgba(220, 38, 38, 0.38)",
        ],
      },
    });
  }

  if (!map.getLayer(WEATHER_DOT_LAYER_ID)) {
    map.addLayer({
      id: WEATHER_DOT_LAYER_ID,
      type: "circle",
      source: WEATHER_SOURCE_ID,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 2.2, 7, 4.2],
        "circle-color": [
          "match",
          ["get", "condition"],
          "sunny",
          "#f59e0b",
          "rainy",
          "#0ea5e9",
          "stormy",
          "#8b5cf6",
          "snowy",
          "#22d3ee",
          "cloudy",
          "#94a3b8",
          "foggy",
          "#cbd5e1",
          "#64748b",
        ],
        "circle-stroke-color": "rgba(255,255,255,0.88)",
        "circle-stroke-width": 1,
        "circle-opacity": 0.92,
      },
    });
  }

  if (!map.getLayer(WEATHER_HIT_LAYER_ID)) {
    map.addLayer({
      id: WEATHER_HIT_LAYER_ID,
      type: "circle",
      source: WEATHER_SOURCE_ID,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 12, 8, 18],
        "circle-color": "rgba(255,255,255,0)",
      },
    });
  }

  if (!map.getLayer(SELECTED_DOT_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_DOT_LAYER_ID,
      type: "circle",
      source: SELECTED_SOURCE_ID,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 6, 8, 10],
        "circle-color": "rgba(8, 145, 178, 0.18)",
        "circle-stroke-color": "#0891b2",
        "circle-stroke-width": 2,
      },
    });
  }
}

function StaticWorldBackdrop() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#d8edf0]" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 aspect-[2/1] w-[max(100vw,1024px)] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-95">
        {FALLBACK_WORLD_TILES.map((tile) => (
          <div
            key={tile.id}
            className="absolute h-1/2 w-1/4 select-none bg-cover bg-center [image-rendering:auto]"
            style={{
              left: `${tile.x * 25}%`,
              top: `${tile.y * 50}%`,
              backgroundImage: `url(${tile.src})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function MapLibreWeatherMap({
  activeLayerId = "temperature",
  selectedCountryCode,
  selectedCountryName,
  selectedCountryCoordinates,
  weatherOverlayPoints = [],
  isWeatherOverlayVisible = false,
  isWeatherOverlayLoading = false,
  weatherOverlayStatusLabel = null,
  onSelectCountry,
  onSelectWeatherOverlayPoint,
  onRefreshWeatherOverlay,
  onToggleWeatherOverlay,
}: MapLibreWeatherMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mapErrorMessage, setMapErrorMessage] = useState<string | null>(null);
  const pointsRef = useRef<WeatherOverlayPoint[]>(weatherOverlayPoints);
  const weatherFeatureCollectionRef = useRef<OverlayFeatureCollection>(
    buildWeatherFeatureCollection(weatherOverlayPoints, activeLayerId),
  );
  const selectedFeatureCollectionRef = useRef<SelectedFeatureCollection>(
    buildSelectedFeatureCollection(selectedCountryCoordinates, selectedCountryName),
  );
  const isWeatherOverlayVisibleRef = useRef(isWeatherOverlayVisible);
  const onSelectCountryRef = useRef(onSelectCountry);
  const onSelectWeatherOverlayPointRef = useRef(onSelectWeatherOverlayPoint);
  const weatherFeatureCollection = useMemo(
    () => buildWeatherFeatureCollection(weatherOverlayPoints, activeLayerId),
    [activeLayerId, weatherOverlayPoints],
  );
  const selectedFeatureCollection = useMemo(
    () => buildSelectedFeatureCollection(selectedCountryCoordinates, selectedCountryName),
    [selectedCountryCoordinates, selectedCountryName],
  );

  useEffect(() => {
    pointsRef.current = weatherOverlayPoints;
  }, [weatherOverlayPoints]);

  useEffect(() => {
    weatherFeatureCollectionRef.current = weatherFeatureCollection;
  }, [weatherFeatureCollection]);

  useEffect(() => {
    selectedFeatureCollectionRef.current = selectedFeatureCollection;
  }, [selectedFeatureCollection]);

  useEffect(() => {
    isWeatherOverlayVisibleRef.current = isWeatherOverlayVisible;
  }, [isWeatherOverlayVisible]);

  useEffect(() => {
    onSelectCountryRef.current = onSelectCountry;
  }, [onSelectCountry]);

  useEffect(() => {
    onSelectWeatherOverlayPointRef.current = onSelectWeatherOverlayPoint;
  }, [onSelectWeatherOverlayPoint]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const mapContainer = containerRef.current;
    let map: MapLibreMap;
    let resizeFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    function resizeMap() {
      if (resizeFrameId !== null) {
        window.cancelAnimationFrame(resizeFrameId);
      }

      resizeFrameId = window.requestAnimationFrame(() => {
        mapRef.current?.resize();
        resizeFrameId = null;
      });
    }

    try {
      map = new maplibregl.Map({
        container: mapContainer,
        style: MAP_STYLE,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        maxBounds: WEATHER_MAP_BOUNDS,
        renderWorldCopies: false,
        attributionControl: false,
        interactive: true,
      });
    } catch (error) {
      window.setTimeout(() => {
        setMapStatus("error");
        setMapErrorMessage(error instanceof Error ? error.message : "Map could not be initialized.");
      }, 0);
      return;
    }

    mapRef.current = map;
    configureMapInteractions(map);
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    resizeObserver = new ResizeObserver(resizeMap);
    resizeObserver.observe(mapContainer);
    resizeMap();

    map.on("error", (event) => {
      setMapStatus("error");
      setMapErrorMessage(event.error?.message ?? "Map tiles could not be loaded.");
    });

    map.on("load", () => {
      setMapStatus("ready");
      setMapErrorMessage(null);
      map.resize();
      addWeatherLayers(map);
      const weatherSource = map.getSource(WEATHER_SOURCE_ID) as GeoJSONSource | undefined;
      const selectedSource = map.getSource(SELECTED_SOURCE_ID) as GeoJSONSource | undefined;
      weatherSource?.setData(weatherFeatureCollectionRef.current);
      selectedSource?.setData(selectedFeatureCollectionRef.current);
      setOverlayLayerVisibility(map, isWeatherOverlayVisibleRef.current);

      map.on("click", WEATHER_HIT_LAYER_ID, (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const pointId = feature ? getFeaturePointId(feature) : null;
        const point = pointsRef.current.find((currentPoint) => currentPoint.id === pointId);

        if (!point) {
          return;
        }

        map.flyTo({
          center: [point.longitude, point.latitude],
          zoom: Math.min(MAX_ZOOM, Math.max(map.getZoom(), 5.2)),
          essential: true,
        });

        if (onSelectWeatherOverlayPointRef.current) {
          onSelectWeatherOverlayPointRef.current(point);
          return;
        }

        onSelectCountryRef.current({
          code: point.countryCode,
          name: point.countryName,
          coordinates: [point.longitude, point.latitude],
        });
      });

      map.on("mouseenter", WEATHER_HIT_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", WEATHER_HIT_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      if (resizeFrameId !== null) {
        window.cancelAnimationFrame(resizeFrameId);
      }

      resizeObserver?.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const weatherSource = map?.getSource(WEATHER_SOURCE_ID) as GeoJSONSource | undefined;

    weatherSource?.setData(weatherFeatureCollection);
  }, [weatherFeatureCollection]);

  useEffect(() => {
    const map = mapRef.current;
    const selectedSource = map?.getSource(SELECTED_SOURCE_ID) as GeoJSONSource | undefined;

    selectedSource?.setData(selectedFeatureCollection);

    if (selectedCountryCoordinates) {
      map?.flyTo({
        center: selectedCountryCoordinates,
        zoom: Math.min(MAX_ZOOM, Math.max(map.getZoom(), 5.2)),
        essential: true,
      });
    }
  }, [selectedCountryCoordinates, selectedFeatureCollection]);

  useEffect(() => {
    const map = mapRef.current;

    if (map?.isStyleLoaded()) {
      setOverlayLayerVisibility(map, isWeatherOverlayVisible);
    }
  }, [isWeatherOverlayVisible]);

  return (
    <div
      className="maplibre-weather-map absolute inset-0 h-full min-h-full w-full min-w-0 overflow-hidden bg-slate-200 dark:bg-slate-950"
      aria-label="Interactive weather map"
    >
      <StaticWorldBackdrop />
      <div ref={containerRef} className="absolute inset-0 z-10 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14%,transparent_84%,rgba(15,23,42,0.06))]" />

      {mapStatus !== "ready" ? (
        <div className="absolute bottom-3 left-3 z-20 max-w-[calc(100%-1.5rem)] rounded-md border border-slate-200 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100">
          {mapStatus === "loading" ? "지도 불러오는 중" : `대체 지도 표시 중${mapErrorMessage ? `: ${mapErrorMessage}` : ""}`}
        </div>
      ) : null}

      {onToggleWeatherOverlay ? (
        <div className="absolute right-3 top-48 z-20 flex flex-wrap justify-end gap-2 md:top-24">
          <button
            type="button"
            onClick={onToggleWeatherOverlay}
            aria-pressed={isWeatherOverlayVisible}
            aria-label={isWeatherOverlayVisible ? "날씨 오버레이 숨기기" : "날씨 오버레이 보기"}
            className={`inline-flex h-10 items-center justify-center rounded-md border px-3 text-xs font-semibold shadow-sm backdrop-blur transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${
              isWeatherOverlayVisible
                ? "border-cyan-500/70 bg-cyan-950/88 text-cyan-50 hover:bg-cyan-900 dark:border-cyan-300/50 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"
                : "border-slate-200 bg-white/92 text-slate-900 hover:bg-white dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            날씨
          </button>
          {onRefreshWeatherOverlay ? (
            <button
              type="button"
              onClick={onRefreshWeatherOverlay}
              disabled={isWeatherOverlayLoading}
              aria-label="실시간 날씨 오버레이 새로고침"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 px-3 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              {isWeatherOverlayLoading ? "갱신 중" : "새로고침"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="absolute left-3 top-48 z-20 flex flex-wrap items-center gap-2 md:left-4 md:top-[31rem]">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="지도 확대"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 font-mono text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="지도 축소"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 font-mono text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, essential: true })}
          aria-label="지도 위치 초기화"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 px-3 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          초기화
        </button>
        {weatherOverlayStatusLabel ? (
          <div
            role="status"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 px-3 text-center text-xs font-semibold leading-none text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100"
          >
            {weatherOverlayStatusLabel}
          </div>
        ) : null}
      </div>

      {selectedCountryCode && selectedCountryName ? (
        <div className="absolute bottom-20 left-3 z-20 max-w-[calc(100%-1.5rem)] rounded-md border border-slate-200 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/86 dark:text-slate-100">
          {selectedCountryName}
        </div>
      ) : null}
    </div>
  );
}
