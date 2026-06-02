import type { KeyboardEvent, MouseEvent } from "react";
import { Geographies, Geography } from "react-simple-maps";

import {
  getAdminBoundaryCenter,
  getAdminBoundaryCode,
  getAdminBoundaryName,
} from "@/lib/map/admin-boundaries";
import type { AdminBoundaryFeature, AdminBoundaryFeatureCollection } from "@/types/admin-boundary";
import type { SelectedRegion } from "@/types/weather-data";

type AdminBoundaryLayerProps = {
  boundaries: AdminBoundaryFeatureCollection | null;
  countryCode: string | null;
  countryName: string | null;
  selectedRegionCode: string | null;
  variant?: "globe" | "regional";
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
  variant = "globe",
  onSelectRegion,
}: AdminBoundaryLayerProps) {
  if (!boundaries || !countryCode || !countryName) {
    return null;
  }

  function selectRegion(feature: RenderedAdminBoundary) {
    if (!countryCode || !countryName) {
      return;
    }

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

  function handleRegionClick(event: MouseEvent<SVGPathElement>, feature: RenderedAdminBoundary) {
    event.stopPropagation();
    selectRegion(feature);
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
          const defaultStyle =
            variant === "regional"
              ? {
                  fill: isSelected ? "rgba(250, 204, 21, 0.74)" : "rgba(236, 253, 245, 0.92)",
                  stroke: isSelected ? "#c2410c" : "rgba(15, 23, 42, 0.62)",
                  strokeWidth: isSelected ? 1.6 : 0.82,
                }
              : {
                  fill: isSelected ? "rgba(250, 204, 21, 0.32)" : "rgba(255,255,255,0.03)",
                  stroke: isSelected ? "#f97316" : "rgba(15, 23, 42, 0.72)",
                  strokeWidth: isSelected ? 1.2 : 0.72,
                };
          const hoverStyle =
            variant === "regional"
              ? {
                  fill: "rgba(167, 243, 208, 0.9)",
                  stroke: "#0f172a",
                  strokeWidth: 1.15,
                }
              : {
                  fill: "rgba(253, 230, 138, 0.35)",
                  stroke: "#0f172a",
                  strokeWidth: 1.05,
                };
          const pressedStyle =
            variant === "regional"
              ? {
                  fill: "rgba(110, 231, 183, 0.9)",
                  stroke: "#0f172a",
                  strokeWidth: 1.2,
                }
              : {
                  fill: "rgba(251, 191, 36, 0.42)",
                  stroke: "#0f172a",
                  strokeWidth: 1.1,
                };

          return (
            <Geography
              key={feature.rsmKey}
              geography={geography}
              aria-label={boundaryName}
              role="button"
              tabIndex={0}
              onClick={(event) => handleRegionClick(event, feature)}
              onKeyDown={(event) => handleRegionKeyDown(event, feature)}
              className="cursor-pointer outline-none transition-colors"
              style={{
                default: defaultStyle,
                hover: hoverStyle,
                pressed: pressedStyle,
              }}
            />
          );
        })
      }
    </Geographies>
  );
}
