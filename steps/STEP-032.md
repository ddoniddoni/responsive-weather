# STEP-032

## Goal

Restore a visible map backdrop without reintroducing duplicated regions in the viewport.

## Scope

- Add a single-world fallback tile mosaic behind MapLibre.
- Use zoom-level 2 world tiles so the fallback shows each region once.
- Preserve MapLibre interaction constraints from the previous step.

## Completion Criteria

- The map area is not blank while MapLibre tiles initialize.
- The fallback does not show Japan, Australia, or other regions twice in one viewport.
- Weather overlay and map controls still render above the map.
- Lint and build pass.

## Checklist

- [x] Add a single-world static fallback backdrop.
- [x] Keep the fallback behind the interactive MapLibre canvas.
- [x] Run lint and build.
