# STEP-010: Weather data source label

## Goal

- Make the weather detail panel clear about whether values come from Open-Meteo, overlay fallback, or mock data.
- Improve trust as realtime and mock data paths coexist.

## Scope

- Add an optional source label to the app weather data model.
- Set source labels in overlay-derived and mock-derived weather data.
- Render a compact source label in the existing detail panel.

## Completion Criteria

- Detail panel shows a concise data source label.
- Overlay-derived weather can identify Open-Meteo or mock overlay fallback.
- Mock country and regional weather identify mock preview data.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 010 branch
- [x] Write Step 010 plan
- [x] Add weather data source label type
- [x] Set source labels in data transformers
- [x] Render source label in detail panel
- [x] Run lint/build verification
- [x] Commit and push Step 010 branch
