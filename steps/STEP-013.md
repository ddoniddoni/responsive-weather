# STEP-013

## Goal

Make the map feel closer to Windy by focusing the user's current location, preventing the full world from zooming too far out, and wrapping horizontal map movement.

## Scope

- Add browser geolocation-based map focusing with a visible locate control and status.
- Raise the map minimum zoom so the full world is not shown as a tiny complete canvas.
- Wrap longitude while panning so horizontal movement continues smoothly.
- Keep fallback behavior stable when geolocation is unavailable or denied.

## Completion Criteria

- The map can request the user's position and focus that coordinate.
- Initial location focus is attempted once on supported browsers.
- Zoom out never drops below the new weather-map minimum.
- Longitude movement wraps around the world instead of hard clamping at -180/180.
- Lint and build pass.

## Checklist

- [x] Update map camera constants and longitude normalization.
- [x] Add geolocation request state and handlers.
- [x] Add accessible locate control and status copy.
- [x] Update docs.
- [x] Run lint and build.
