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
                  fill: isSelected ? "rgba(180, 83, 9, 0.58)" : "rgba(248, 250, 252, 0.88)",
                  stroke: isSelected ? "#7c2d12" : "rgba(17, 24, 39, 0.58)",
                  strokeWidth: isSelected ? 1.6 : 0.82,
                }
              : {
                  fill: isSelected ? "rgba(180, 83, 9, 0.24)" : "rgba(255,255,255,0.03)",
                  stroke: isSelected ? "#b45309" : "rgba(17, 24, 39, 0.62)",
                  strokeWidth: isSelected ? 1.2 : 0.72,
                };
          const hoverStyle =
            variant === "regional"
              ? {
                  fill: "rgba(209, 213, 219, 0.92)",
                  stroke: "#0f172a",
                  strokeWidth: 1.15,
                }
              : {
                  fill: "rgba(217, 180, 111, 0.32)",
                  stroke: "#0f172a",
                  strokeWidth: 1.05,
                };
          const pressedStyle =
            variant === "regional"
              ? {
                  fill: "rgba(180, 83, 9, 0.5)",
                  stroke: "#0f172a",
                  strokeWidth: 1.2,
                }
              : {
                  fill: "rgba(180, 83, 9, 0.34)",
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
              className="cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
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
