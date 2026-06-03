# STEP-023: Weather map control system

## Goal

- Turn the Ventusky-inspired map-first screen into a cleaner product-grade control system.
- Separate the top bar, layer rail, legend, and timeline from the dashboard container.
- Improve font handling, weather units, and compact control density without adding new dependencies.

## Scope

- Add reusable dashboard control components for the map UI.
- Move weather layer and forecast time definitions into constants.
- Keep the existing globe, regional detail, mock weather, and theme behavior.
- Fix broken temperature unit text and make labels more consistent.
- Use a Korean-friendly product font through Next font configuration.

## Out of Scope

- Real weather API integration.
- MapLibre, Leaflet, radar tiles, wind particles, or third-party map engines.
- Authentication, saved places, billing, or account features.
- Copying Ventusky branding, proprietary assets, or exact UI.

## Completion Criteria

- Weather dashboard JSX is smaller and reads as composition.
- Map controls look denser and less toy-like on desktop and mobile.
- Temperature units render correctly.
- Light/dark theme still works.
- Mobile layout has no horizontal overflow.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 023 branch
- [x] Add Step 023 plan
- [x] Add weather layer constants/types
- [x] Split map-first dashboard controls into components
- [x] Update font and unit rendering
- [x] Verify responsive layout
- [x] Run lint/build
- [x] Commit and push Step 023 branch
