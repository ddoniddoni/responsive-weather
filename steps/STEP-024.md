# STEP-024

## Goal

Add controlled location pick markers to the MapLibre map so users can select supported countries directly without relying on large raster basemap labels.

## Scope

- Pass searchable locations into the MapLibre map.
- Render compact app-owned location markers over the basemap.
- Select a location marker through the existing weather detail flow.
- Keep the basemap label-free and preserve weather overlay interactions.

## Completion Criteria

- Supported locations appear as small readable markers on the map.
- Clicking a location marker opens the existing weather detail panel.
- Weather overlay markers and map drag/zoom still work.
- Lint and build pass.

## Checklist

- [x] Add selectable location markers.
- [x] Connect marker selection to dashboard state.
- [x] Run lint and build.
