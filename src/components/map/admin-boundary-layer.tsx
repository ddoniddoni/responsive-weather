import { geoCentroid } from "d3-geo";
import type { KeyboardEvent } from "react";
import { Geographies, Geography } from "react-simple-maps";

import { getAdminBoundaryCode, getAdminBoundaryName } from "@/lib/map/admin-boundaries";
import type { AdminBoundaryFeature, AdminBoundaryFeatureCollection } from "@/types/admin-boundary";
import type { SelectedRegion } from "@/types/weather-data";

type AdminBoundaryLayerProps = {
  boundaries: AdminBoundaryFeatureCollection | null;
  countryCode: string | null;
  countryName: string | null;
  selectedRegionCode: string | null;
  onSelectRegion: (region: SelectedRegion) => void;
};

type RenderedAdminBoundary = AdminBoundaryFeature & {
  rsmKey: string;
};

export function AdminBoundaryLayer({
  boundaries,
  countryCode,
  countryName,
  selectedRegionCode,
  onSelectRegion,
}: AdminBoundaryLayerProps) {
  if (!boundaries || !countryCode || !countryName) {
    return null;
  }

  function selectRegion(feature: RenderedAdminBoundary) {
    if (!countryCode || !countryName) {
      return;
    }

    onSelectRegion({
      countryCode,
      countryName,
      regionCode: getAdminBoundaryCode(feature),
      regionName: getAdminBoundaryName(feature),
      coordinates: geoCentroid(feature as never) as [number, number],
    });
  }

  function handleRegionKeyDown(event: KeyboardEvent<SVGPathElement>, feature: RenderedAdminBoundary) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    selectRegion(feature);
  }

  return (
    <Geographies geography={boundaries}>
      {({ geographies }) =>
        geographies.map((geography) => {
          const feature = geography as RenderedAdminBoundary;
          const boundaryName = getAdminBoundaryName(feature);
          const boundaryCode = getAdminBoundaryCode(feature);
          const isSelected = selectedRegionCode === boundaryCode;

          return (
            <Geography
              key={feature.rsmKey}
              geography={geography}
              aria-label={boundaryName}
              role="button"
              tabIndex={0}
              onClick={() => selectRegion(feature)}
              onKeyDown={(event) => handleRegionKeyDown(event, feature)}
              className="cursor-pointer outline-none transition-colors"
              style={{
                default: {
                  fill: isSelected ? "rgba(250, 204, 21, 0.32)" : "rgba(255,255,255,0.03)",
                  stroke: isSelected ? "#f97316" : "rgba(15, 23, 42, 0.72)",
                  strokeWidth: isSelected ? 1.2 : 0.72,
                },
                hover: {
                  fill: "rgba(253, 230, 138, 0.35)",
                  stroke: "#0f172a",
                  strokeWidth: 1.05,
                },
                pressed: {
                  fill: "rgba(251, 191, 36, 0.42)",
                  stroke: "#0f172a",
                  strokeWidth: 1.1,
                },
              }}
            />
          );
        })
      }
    </Geographies>
  );
}
