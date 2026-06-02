# STEP-020: Detailed regional map mode plan

## Goal

- Transition from the globe view into a detailed regional map mode when the user clicks the selected country's `Detail` button.
- Use the globe for country discovery and the detailed map for local exploration, city labels, terrain context, and finer regional navigation.

## Why This Step

- The current globe uses SVG country and ADM1 boundary data, so zooming should not automatically change modes.
- Detailed terrain, roads, cities, and richer labels require a map engine and tile source instead of the current world-atlas SVG layer.
- A mode transition keeps the globe lightweight while allowing the selected region experience to become more map-like.

## Recommended Direction

- Use MapLibre GL for the detailed regional map mode.
- Prefer free/open tile sources first.
- Keep API-key based providers optional and isolated behind configuration.
- Start with Korea as the first supported detailed mode target, then generalize.

## Implementation Note

- This step starts with a no-new-dependency regional mode scaffold.
- MapLibre GL and tile-provider selection are deferred until the tile source and API-key requirements are confirmed.
- Regional detail mode is entered explicitly from the selected country popout.
- The regional SVG scaffold uses ADM1 bounds to fit the selected country's regions without sharing globe projection state.
- MapLibre remains the recommended follow-up when roads, terrain, and city labels are required.

## Scope

- Add a map mode state such as `globe` and `regional`.
- Enter regional mode only when the selected country's `Detail` button is clicked.
- Add a detailed regional map component separated from `WorldMap`.
- Center the detailed map on the selected country or selected ADM1 region.
- Show ADM1 boundaries and region selection in the detailed map.
- Provide a clear way to return to the globe.
- Keep weather details in the existing side panel rather than drawing weather values directly on the map.

## Out of Scope

- Real weather API integration.
- Authentication, saved places, or user accounts.
- Full global detailed-map support in the first pass.
- ADM2 district/county selection unless the data source is confirmed during implementation.

## Candidate File Changes

- `src/components/map/world-map.tsx`
- `src/components/map/regional-map.tsx`
- `src/components/map/map-mode-toggle.tsx`
- `src/hooks/use-map-mode.ts`
- `src/lib/map/admin-boundaries.ts`
- `src/types/map-mode.ts`

## UX Flow

1. User clicks a country on the globe.
2. Globe rotates and zooms toward that country.
3. The selected country popout shows a `Detail` button when ADM1 boundaries are available.
4. User clicks `Detail` to enter regional mode.
5. Detailed mode shows a flat interactive map fitted to the selected country's ADM1 boundaries.
6. User can select regions more comfortably.
7. User can return to the globe with a compact control.

## Data Questions To Confirm

- Which tile source should be used for MapLibre in development?
- Should ADM2 be part of this step or a follow-up step?
- Which countries should receive curated regional map tuning beyond bbox fit?

## Completion Criteria

- Selecting a country and clicking `Detail` can show a detailed regional map mode when ADM1 data is available.
- Detailed mode has a clear return-to-globe control.
- Country and region weather panel behavior remains intact.
- The globe does not try to render roads, terrain, or city labels itself.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Defer tile source and API-key requirements to a follow-up decision
- [x] Create Step 020 branch
- [x] Add map mode type/state
- [x] Add regional map component scaffold
- [x] Add Detail button mode transition trigger
- [x] Fit regional map from selected country boundary bounds
- [x] Preserve weather panel selection behavior
- [x] Add return-to-globe control
- [ ] Verify responsive layout
- [x] Verify lint/build
- [x] Commit Step 020 changes when implementation stabilizes
