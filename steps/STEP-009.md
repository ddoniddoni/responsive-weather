# STEP-009: Reuse overlay weather for country selection

## Goal

- Reuse already-loaded Open-Meteo overlay data for matching country and search selections.
- Reduce mock-only behavior for curated countries without adding more API requests.

## Scope

- Find the closest overlay point for a selected country when overlay data has matching country codes.
- Use that overlay point for the existing weather detail panel.
- Keep region selections on the existing mock regional fallback.
- Keep countries without representative overlay points on mock country fallback.

## Completion Criteria

- Search or country selection for curated countries can show realtime overlay-backed detail values.
- Overlay marker selection behavior remains unchanged.
- Region selection continues to show regional mock weather.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 009 branch
- [x] Write Step 009 plan
- [x] Add closest overlay point lookup
- [x] Reuse overlay point data in country/search selection
- [x] Preserve region and unknown-country fallback behavior
- [x] Run lint/build verification
- [x] Commit and push Step 009 branch
