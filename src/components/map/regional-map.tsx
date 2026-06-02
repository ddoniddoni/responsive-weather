import { geoMercator, geoPath } from "d3-geo";
import { useMemo } from "react";

import {
  getAdminBoundaryCenter,
  getAdminBoundaryCode,
  getAdminBoundaryName,
} from "@/lib/map/admin-boundaries";
import type { AdminBoundaryFeature, AdminBoundaryFeatureCollection } from "@/types/admin-boundary";
import type { SelectedRegion } from "@/types/weather-data";

type RegionalMapProps = {
  boundaries: AdminBoundaryFeatureCollection | null;
  countryCode: string;
  countryName: string;
  selectedRegionCode: string | null;
  selectedLabel: string | null;
  selectedMarkerCoordinates: [number, number] | null;
  statusLabel: string | null;
  onSelectRegion: (region: SelectedRegion) => void;
  onReturnToGlobe: () => void;
};

type FitExtentObject = Parameters<ReturnType<typeof geoMercator>["fitExtent"]>[1];
type GeoPathInput = Parameters<ReturnType<typeof geoPath>>[0];

const MAP_WIDTH = 800;
const MAP_HEIGHT = 520;
const MAP_PADDING_X = 86;
const MAP_PADDING_Y = 62;

type PolygonGeometry = {
  type: "Polygon";
  coordinates: number[][][];
};

type MultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};

function isPolygonGeometry(geometry: unknown): geometry is PolygonGeometry {
  return (
    typeof geometry === "object" &&
    geometry !== null &&
    "type" in geometry &&
    geometry.type === "Polygon" &&
    "coordinates" in geometry &&
    Array.isArray(geometry.coordinates)
  );
}

function isMultiPolygonGeometry(geometry: unknown): geometry is MultiPolygonGeometry {
  return (
    typeof geometry === "object" &&
    geometry !== null &&
    "type" in geometry &&
    geometry.type === "MultiPolygon" &&
    "coordinates" in geometry &&
    Array.isArray(geometry.coordinates)
  );
}

function reverseRingWinding(geometry: unknown) {
  if (isPolygonGeometry(geometry)) {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) => [...ring].reverse()),
    };
  }

  if (isMultiPolygonGeometry(geometry)) {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) => polygon.map((ring) => [...ring].reverse())),
    };
  }

  return geometry;
}

function getRenderableBoundaries(
  boundaries: AdminBoundaryFeatureCollection | null,
): AdminBoundaryFeatureCollection | null {
  if (!boundaries) {
    return null;
  }

  return {
    ...boundaries,
    features: boundaries.features.map((feature) => ({
      ...feature,
      geometry: reverseRingWinding(feature.geometry),
    })),
  };
}

function createRegionalProjection(boundaries: AdminBoundaryFeatureCollection | null) {
  if (!boundaries || boundaries.features.length === 0) {
    return geoMercator()
      .center([0, 20])
      .scale(900)
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);
  }

  return geoMercator().fitExtent(
    [
      [MAP_PADDING_X, MAP_PADDING_Y],
      [MAP_WIDTH - MAP_PADDING_X, MAP_HEIGHT - MAP_PADDING_Y],
    ],
    boundaries as unknown as FitExtentObject,
  );
}

export function RegionalMap({
  boundaries,
  countryCode,
  countryName,
  selectedRegionCode,
  selectedLabel,
  selectedMarkerCoordinates,
  statusLabel,
  onSelectRegion,
  onReturnToGlobe,
}: RegionalMapProps) {
  const renderableBoundaries = useMemo(() => getRenderableBoundaries(boundaries), [boundaries]);
  const { path, projectPoint } = useMemo(() => {
    const projection = createRegionalProjection(renderableBoundaries);

    return {
      path: geoPath(projection),
      projectPoint: (coordinates: [number, number]) => projection(coordinates),
    };
  }, [renderableBoundaries]);
  const markerPoint = selectedMarkerCoordinates ? projectPoint(selectedMarkerCoordinates) : null;

  function handleSelectRegion(feature: AdminBoundaryFeature) {
    const coordinates = getAdminBoundaryCenter(feature);

    if (!coordinates) {
      return;
    }

    onSelectRegion({
      countryCode,
      countryName,
      regionCode: getAdminBoundaryCode(feature),
      regionName: getAdminBoundaryName(feature),
      coordinates,
    });
  }

  return (
    <div className="relative z-10 h-full w-full bg-[linear-gradient(135deg,#dff6ff_0%,#e7f9f3_48%,#f8fafc_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#082f49_52%,#111827_100%)]">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="h-full w-full"
        role="img"
        aria-label={`${countryName} regional map`}
      >
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="transparent" />
        <g>
          {renderableBoundaries?.features.map((feature) => {
            const regionCode = getAdminBoundaryCode(feature);
            const regionName = getAdminBoundaryName(feature);
            const isSelected = selectedRegionCode === regionCode;
            const pathData = path(feature as GeoPathInput);

            if (!pathData) {
              return null;
            }

            return (
              <path
                key={regionCode}
                d={pathData}
                role="button"
                tabIndex={0}
                aria-label={regionName}
                onClick={() => handleSelectRegion(feature)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") {
                    return;
                  }

                  event.preventDefault();
                  handleSelectRegion(feature);
                }}
                className="cursor-pointer outline-none transition-colors"
                fill={isSelected ? "rgba(250, 204, 21, 0.76)" : "rgba(236, 253, 245, 0.94)"}
                stroke={isSelected ? "#c2410c" : "rgba(15, 23, 42, 0.62)"}
                strokeWidth={isSelected ? 1.8 : 0.9}
              />
            );
          })}
        </g>

        {markerPoint ? (
          <g className="pointer-events-none" aria-hidden="true" transform={`translate(${markerPoint[0]} ${markerPoint[1]})`}>
            <circle r="5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
            <circle r="11" fill="none" stroke="rgba(249,115,22,0.35)" strokeWidth="2" />
            <foreignObject x="-84" y="-48" width="168" height="34" className="overflow-visible">
              <div className="flex h-8 items-center justify-center rounded-md border border-white/80 bg-white/92 px-3 text-center text-xs font-semibold text-slate-900 shadow-sm backdrop-blur dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100">
                <span className="max-w-[136px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {selectedLabel ?? countryName}
                </span>
              </div>
            </foreignObject>
          </g>
        ) : null}
      </svg>

      <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onReturnToGlobe}
          aria-label="Return to globe map"
          className="inline-flex h-9 items-center justify-center rounded-md border border-white/75 bg-white/92 px-3 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur hover:bg-white dark:border-slate-600 dark:bg-slate-900/86 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Globe
        </button>
        <span className="rounded-md border border-white/75 bg-white/86 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100">
          Regional mode
        </span>
      </div>

      {statusLabel ? (
        <div
          role="status"
          className="absolute bottom-3 left-3 z-20 max-w-[calc(100%-1.5rem)] rounded-md border border-white/75 bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-600 dark:bg-slate-900/86 dark:text-slate-100"
        >
          {statusLabel}
        </div>
      ) : null}
    </div>
  );
}
