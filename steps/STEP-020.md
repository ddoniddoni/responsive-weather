# STEP-020

## Goal

Introduce a MapLibre GL based weather map so the main dashboard uses a real tiled map with lightweight weather layers.

## Scope

- Add MapLibre GL as the map rendering engine.
- Create a MapLibre weather map component under `components/map/`.
- Render realtime overlay points as MapLibre heatmap, dot, and temperature label layers.
- Preserve existing dashboard controls, search selection, overlay toggle, refresh, and weather detail panel flow.

## Completion Criteria

- The dashboard renders a MapLibre map instead of the SVG world map.
- Weather overlay points appear as map layers rather than large SVG markers.
- Selecting an overlay point opens the existing weather detail panel.
- Lint and build pass.

## Checklist

- [x] Add MapLibre GL dependency.
- [x] Build MapLibre weather map component.
- [x] Connect dashboard to MapLibre map.
- [x] Run lint and build.
