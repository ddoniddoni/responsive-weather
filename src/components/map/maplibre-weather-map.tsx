"use client";

import maplibregl, {
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
  type Map as MapLibreMap,
  type StyleSpecification,
} from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";

import type { WeatherLayerId } from "@/types/weather-layer";
import type { SelectedCountry, WeatherOverlayPoint } from "@/types/weather-data";

const DEFAULT_CENTER: [number, number] = [127.335, 35.815];
const DEFAULT_ZOOM = 3.6;
const WEATHER_SOURCE_ID = "weather-overlay-points";
const SELECTED_SOURCE_ID = "selected-weather-location";
const WEATHER_HEAT_LAYER_ID = "weather-heat-layer";
const WEATHER_DOT_LAYER_ID = "weather-point-dot-layer";
const WEATHER_LABEL_LAYER_ID = "weather-point-label-layer";
const WEATHER_HIT_LAYER_ID = "weather-point-hit-layer";
const SELECTED_DOT_LAYER_ID = "selected-weather-dot-layer";

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
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-raster",
      type: "raster",
      source: "osm",
      paint: {
        "raster-saturation": -0.18,
        "raster-contrast": 0.12,
        "raster-brightness-min": 0.08,
        "raster-brightness-max": 0.94,
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

  [WEATHER_HEAT_LAYER_ID, WEATHER_DOT_LAYER_ID, WEATHER_LABEL_LAYER_ID, WEATHER_HIT_LAYER_ID].forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
  });
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
        "heatmap-weight": ["interpolate", ["linear"], ["get", "value"], 0, 0.08, 1, 0.85],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 2, 0.8, 8, 1.7],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 2, 22, 6, 54, 9, 86],
        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0.78, 8, 0.38],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(14, 165, 233, 0)",
          0.18,
          "rgba(14, 165, 233, 0.32)",
          0.36,
          "rgba(34, 197, 94, 0.42)",
          0.58,
          "rgba(250, 204, 21, 0.5)",
          0.78,
          "rgba(249, 115, 22, 0.58)",
          1,
          "rgba(220, 38, 38, 0.62)",
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

  if (!map.getLayer(WEATHER_LABEL_LAYER_ID)) {
    map.addLayer({
      id: WEATHER_LABEL_LAYER_ID,
      type: "symbol",
      source: WEATHER_SOURCE_ID,
      minzoom: 3,
      layout: {
        "text-field": ["concat", ["to-string", ["get", "temperature"]], "\u00b0"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 3, 10, 8, 13],
        "text-offset": [0, 1.05],
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#111827",
        "text-halo-color": "rgba(255,255,255,0.92)",
        "text-halo-width": 1.4,
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

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
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

        map.flyTo({ center: [point.longitude, point.latitude], zoom: Math.max(map.getZoom(), 5.2), essential: true });

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
      map?.flyTo({ center: selectedCountryCoordinates, zoom: Math.max(map.getZoom(), 5.2), essential: true });
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
      className="maplibre-weather-map relative h-full min-h-[720px] min-w-0 overflow-hidden bg-slate-200 dark:bg-slate-950"
      aria-label="Interactive weather map"
    >
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),transparent_18%,transparent_78%,rgba(15,23,42,0.2))]" />

      {onToggleWeatherOverlay ? (
        <div className="absolute right-3 top-48 z-20 flex flex-wrap justify-end gap-2 md:top-24">
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

      <div className="absolute left-3 top-48 z-20 flex flex-wrap gap-2 md:left-4 md:top-[31rem]">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom map in"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 font-mono text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom map out"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/92 font-mono text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-700 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, essential: true })}
          aria-label="Reset map view"
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

      {selectedCountryCode && selectedCountryName ? (
        <div className="absolute bottom-20 left-3 z-20 max-w-[calc(100%-1.5rem)] rounded-md border border-slate-200 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/86 dark:text-slate-100">
          {selectedCountryName}
        </div>
      ) : null}
    </div>
  );
}
