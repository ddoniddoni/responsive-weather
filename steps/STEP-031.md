# STEP-031

## Goal

Remove duplicate-looking map regions from the first viewport so each area appears only once.

## Scope

- Remove the static raster tile backdrop that can show repeated map fragments.
- Constrain the raster tile source to world bounds.
- Raise the minimum zoom enough to avoid a wide viewport exposing repeated world edges.

## Completion Criteria

- The viewport does not show the same region twice.
- Loading state still has a clean background without fake duplicate map tiles.
- Existing map interactions, weather overlay selection, and reset behavior remain intact.
- Lint and build pass.

## Checklist

- [x] Remove duplicate-prone static tile backdrop.
- [x] Bound raster source and minimum zoom.
- [x] Run lint and build.
