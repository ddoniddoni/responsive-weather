# STEP-005: Overlay detail weather data

## Goal

- Show Open-Meteo normalized weather values in the detail panel when a user selects a realtime overlay marker.
- Keep existing mock weather as the fallback for country and regional map selections.

## Scope

- Extend the overlay point model with detail-panel fields already returned by Open-Meteo.
- Normalize current temperature, apparent temperature, humidity, wind speed, condition, and updated time from Open-Meteo.
- Convert a selected overlay point into the app's `WeatherData` shape.
- Preserve existing country, region, search, map, theme, and overlay toggle behavior.

## Completion Criteria

- Selecting an overlay marker opens the existing detail panel with realtime overlay values.
- Selecting a country, region, or search result still uses the existing mock/fallback weather flow.
- Overlay API failure still falls back to mock overlay points without blocking map selection.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 005 branch
- [x] Write Step 005 plan
- [x] Extend overlay weather data type
- [x] Normalize Open-Meteo detail fields
- [x] Add overlay point to detail-panel conversion
- [x] Wire overlay marker selection into dashboard weather state
- [x] Run lint/build verification
- [x] Commit and push Step 005 branch
