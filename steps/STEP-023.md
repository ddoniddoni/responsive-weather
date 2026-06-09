# STEP-023

## Goal

Make the MapLibre map fill the dashboard viewport and keep its draggable hit area aligned with the visible map.

## Scope

- Pin the MapLibre map surface to the full dashboard bounds.
- Resize the MapLibre canvas when its container changes size.
- Ensure MapLibre canvas and container elements fill the available area.
- Preserve existing weather overlay, controls, and detail panel behavior.

## Completion Criteria

- The map fills the full dashboard background area.
- Dragging works anywhere on the visible map outside overlay controls.
- Zoom controls and overlay point selection still work.
- Lint and build pass.

## Checklist

- [x] Make map surface fill the dashboard viewport.
- [x] Add container resize handling for MapLibre.
- [x] Run lint and build.
