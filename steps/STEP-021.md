# STEP-021

## Goal

Improve the MapLibre basemap quality so the dashboard map looks crisp, less gray, and free of oversized baked-in country labels.

## Scope

- Replace the labeled gray raster basemap with high-density no-label CARTO Voyager tiles.
- Update the static fallback backdrop to use the same no-label visual direction.
- Tune raster paint values so land and water read clearly without washing out the weather layers.
- Keep existing weather overlay, selection, refresh, and panel behavior unchanged.

## Completion Criteria

- The map no longer shows oversized raster country labels.
- The basemap appears sharper and less gray on desktop and mobile.
- Weather overlay layers remain readable on top of the basemap.
- Lint and build pass.

## Checklist

- [x] Replace MapLibre basemap tiles.
- [x] Update fallback map backdrop.
- [x] Run lint and build.
