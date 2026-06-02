import { ComposableMap, Graticule, Marker } from "react-simple-maps";

import { AdminBoundaryLayer } from "@/components/map/admin-boundary-layer";
import type { AdminBoundaryFeatureCollection } from "@/types/admin-boundary";
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

type RegionalMapConfig = {
  center: [number, number];
  scale: number;
};

const REGIONAL_MAP_CONFIG_BY_COUNTRY_CODE: Record<string, RegionalMapConfig> = {
  KOR: {
    center: [127.85, 36.45],
    scale: 6500,
  },
};

const DEFAULT_REGIONAL_MAP_CONFIG: RegionalMapConfig = {
  center: [0, 20],
  scale: 900,
};

function getRegionalMapConfig(countryCode: string, selectedMarkerCoordinates: [number, number] | null) {
  const configuredMap = REGIONAL_MAP_CONFIG_BY_COUNTRY_CODE[countryCode];

  if (configuredMap) {
    return configuredMap;
  }

  return {
    ...DEFAULT_REGIONAL_MAP_CONFIG,
    center: selectedMarkerCoordinates ?? DEFAULT_REGIONAL_MAP_CONFIG.center,
  };
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
  const regionalMapConfig = getRegionalMapConfig(countryCode, selectedMarkerCoordinates);

  return (
    <div className="relative z-10 h-full w-full bg-[linear-gradient(135deg,#ecfeff_0%,#eef2ff_48%,#f8fafc_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#082f49_52%,#111827_100%)]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: regionalMapConfig.center,
          scale: regionalMapConfig.scale,
        }}
        className="h-full w-full"
        aria-label={`${countryName} regional map`}
      >
        <rect width="800" height="600" fill="transparent" />
        <Graticule stroke="rgba(14, 116, 144, 0.12)" strokeWidth={0.35} />
        <AdminBoundaryLayer
          boundaries={boundaries}
          countryCode={countryCode}
          countryName={countryName}
          selectedRegionCode={selectedRegionCode}
          onSelectRegion={onSelectRegion}
        />
        {selectedMarkerCoordinates ? (
          <Marker coordinates={selectedMarkerCoordinates}>
            <g className="pointer-events-none" aria-hidden="true">
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
          </Marker>
        ) : null}
      </ComposableMap>

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
