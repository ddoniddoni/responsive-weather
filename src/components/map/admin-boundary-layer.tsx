import { Geographies, Geography } from "react-simple-maps";

import { getAdminBoundaryName } from "@/lib/map/admin-boundaries";
import type { AdminBoundaryFeature, AdminBoundaryFeatureCollection } from "@/types/admin-boundary";

type AdminBoundaryLayerProps = {
  boundaries: AdminBoundaryFeatureCollection | null;
};

type RenderedAdminBoundary = AdminBoundaryFeature & {
  rsmKey: string;
};

export function AdminBoundaryLayer({ boundaries }: AdminBoundaryLayerProps) {
  if (!boundaries) {
    return null;
  }

  return (
    <Geographies geography={boundaries}>
      {({ geographies }) =>
        geographies.map((geography) => {
          const feature = geography as RenderedAdminBoundary;
          const boundaryName = getAdminBoundaryName(feature);

          return (
            <Geography
              key={feature.rsmKey}
              geography={geography}
              aria-label={boundaryName}
              className="pointer-events-none outline-none"
              style={{
                default: {
                  fill: "rgba(255,255,255,0.03)",
                  stroke: "rgba(15, 23, 42, 0.72)",
                  strokeWidth: 0.72,
                },
                hover: {
                  fill: "rgba(255,255,255,0.03)",
                  stroke: "rgba(15, 23, 42, 0.72)",
                  strokeWidth: 0.72,
                },
                pressed: {
                  fill: "rgba(255,255,255,0.03)",
                  stroke: "rgba(15, 23, 42, 0.72)",
                  strokeWidth: 0.72,
                },
              }}
            />
          );
        })
      }
    </Geographies>
  );
}
