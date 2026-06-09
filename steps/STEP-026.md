# STEP-026

## Goal

Remove the floating country name markers from the MapLibre map so map movement feels clean and stable.

## Scope

- Remove app-owned location DOM markers from the map surface.
- Keep search-based location selection available in the top bar.
- Keep weather overlay points, map drag/zoom, and weather detail panel behavior unchanged.
- Remove unused marker styling.

## Completion Criteria

- Country name markers no longer appear on the moving map.
- Search still selects supported countries.
- Weather overlay markers still open the weather detail panel.
- Lint and build pass.

## Checklist

- [x] Remove location marker rendering.
- [x] Remove unused marker styles and props.
- [x] Run lint and build.
