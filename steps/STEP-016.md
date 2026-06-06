# STEP-016

## Goal

Support Windy-like coordinate deep links so the map can open directly at a shared latitude, longitude, and zoom.

## Scope

- Parse query strings shaped like `?37.482,127.139,5`.
- Parse explicit query params like `?lat=37.482&lon=127.139&zoom=5`.
- Apply the deep link camera once after the client mounts.
- Skip automatic geolocation when a valid deep link camera is present.

## Completion Criteria

- Valid URL coordinates focus the map without requiring user interaction.
- Invalid query strings fall back to the default map camera.
- Browser geolocation does not override a URL camera.
- Lint and build pass.

## Checklist

- [x] Add deep link camera parser.
- [x] Apply deep link camera on mount.
- [x] Prevent auto geolocation from overriding deep links.
- [x] Update docs.
- [x] Run lint and build.
