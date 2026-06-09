# STEP-022

## Goal

Restore direct map navigation so users can pan, zoom, and interact with the MapLibre weather map naturally.

## Scope

- Explicitly enable MapLibre pan, wheel zoom, touch zoom, keyboard navigation, box zoom, and double-click zoom.
- Keep map rotation disabled so the weather dashboard stays in a flat-map mode.
- Improve cursor affordance for drag navigation.
- Preserve existing weather overlay, layer controls, search, and detail panel behavior.

## Completion Criteria

- Users can drag the map to move around.
- Users can zoom with wheel, touch, controls, and keyboard interactions.
- Weather overlay point selection still opens the detail panel.
- Lint and build pass.

## Checklist

- [x] Enable MapLibre navigation handlers.
- [x] Add drag cursor affordance.
- [x] Run lint and build.
