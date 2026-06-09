# STEP-027

## Goal

Improve the MapLibre basemap clarity so borders, coastlines, and map features are easier to read.

## Scope

- Switch from the muted no-label Voyager raster tiles to the standard high-density Voyager raster tiles.
- Increase raster contrast without making the weather overlay overpowering.
- Reduce haze from the dashboard gradient and weather heatmap.
- Preserve map drag/zoom, weather overlay selection, search, and weather panel behavior.

## Completion Criteria

- The map no longer looks overly foggy.
- Country/coastline boundaries and roads are easier to see.
- Weather overlay remains visible without washing out the basemap.
- Lint and build pass.

## Checklist

- [x] Improve basemap tile clarity.
- [x] Reduce visual haze from overlay effects.
- [x] Run lint and build.
