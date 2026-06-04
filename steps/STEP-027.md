# STEP-027: Weather insight panel

## Goal

- Make the weather detail panels feel more like a production weather product.
- Add concise atmospheric insights beyond the basic temperature, humidity, and wind cards.
- Keep the work mock-data based and API-ready without adding external services.

## Scope

- Extend `WeatherData` with pressure and visibility fields.
- Update mock country, region, and fallback weather data.
- Add a reusable weather insight component for desktop and mobile detail surfaces.
- Show pressure, visibility, and comfort signals in a compact, scannable layout.
- Preserve the existing map, search, mobile sheet, timeline, and layer behavior.

## Out of Scope

- Real weather API integration.
- Long-range forecast, hourly forecast data, alerts, or radar tiles.
- New dependencies, account features, favorites, or persisted settings.
- Changing the map implementation or weather layer controls.

## Completion Criteria

- Weather detail panel shows added atmospheric insights.
- Mobile weather sheet shows the same insight structure in a compact layout.
- Mock weather data remains type-safe with no `any`.
- Existing selected country and region flows continue to work.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 027 branch
- [x] Add Step 027 plan
- [x] Extend weather data type and mock data
- [x] Add weather insight component
- [x] Add insights to desktop panel and mobile sheet
- [x] Run lint/build
- [x] Commit and push Step 027 branch
