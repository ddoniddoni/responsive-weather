# STEP-026: Mobile weather bottom sheet

## Goal

- Make the weather detail experience feel usable on mobile like a production weather map.
- Keep the map visible and controllable while still making selected weather details easy to reach.
- Preserve the current desktop overlay behavior.

## Scope

- Add a mobile-only weather bottom sheet above the forecast timeline.
- Support collapsed and expanded states for the mobile weather sheet.
- Open the mobile sheet when a country or region is selected.
- Keep desktop weather detail as the existing right-side map overlay.
- Improve empty mobile detail state without changing mock weather data.

## Out of Scope

- Real weather API integration.
- Gesture dragging physics or third-party drawer libraries.
- Changing map engines, weather layers, or timeline behavior.
- Saved places, accounts, analytics, or persisted sheet state.

## Completion Criteria

- Mobile users can collapse and expand the weather detail sheet.
- Selecting a country or region opens the mobile weather sheet.
- Desktop layout continues to show the existing overlay panel.
- The bottom timeline remains reachable on mobile.
- Mobile layout avoids horizontal overflow.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 026 branch
- [x] Add Step 026 plan
- [x] Add mobile weather sheet component
- [x] Connect selected weather changes to sheet state
- [x] Split mobile and desktop weather panel layout
- [x] Verify responsive layout
- [x] Run lint/build
- [x] Commit and push Step 026 branch
