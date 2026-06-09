# STEP-030

## Goal

Constrain the interactive map viewport so the basemap does not appear duplicated or drift outside a controlled world range.

## Scope

- Disable repeated world copies in MapLibre.
- Add map bounds and zoom limits for desktop and mobile use.
- Keep weather marker selection, fly-to behavior, and reset behavior intact.

## Completion Criteria

- The map renders as one continuous world view instead of repeating horizontally.
- Users cannot pan far outside the intended map extent.
- Zoom controls remain usable without exposing duplicate map copies.
- Lint and build pass.

## Checklist

- [x] Add viewport bounds and zoom constants.
- [x] Apply MapLibre render and interaction constraints.
- [x] Run lint and build.
