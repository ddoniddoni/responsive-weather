# STEP-020: Detailed regional map mode plan

## Goal

- Transition from the globe view into a detailed regional map mode when a selected country is zoomed in deeply.
- Use the globe for country discovery and the detailed map for local exploration, city labels, terrain context, and finer regional navigation.

## Why This Step

- The current globe uses SVG country and ADM1 boundary data, so zooming only enlarges the same boundary shapes.
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
- Korea is the first supported automatic regional mode target.

## Scope

- Add a map mode state such as `globe` and `regional`.
- Enter regional mode when a selected country is zoomed past a threshold, for example `scale >= 3000`.
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
3. If the zoom passes the regional threshold, the map switches to detailed regional mode.
4. Detailed mode shows a flat interactive map centered on the selected country.
5. User can select regions more comfortably.
6. User can return to the globe with a compact control.

## Data Questions To Confirm

- Which tile source should be used for MapLibre in development?
- Should detailed mode initially support Korea only?
- Should ADM2 be part of this step or a follow-up step?
- Should regional mode switch automatically by zoom threshold, by button, or both?

## Completion Criteria

- Selecting Korea and zooming past the threshold can show a detailed regional map mode.
- Detailed mode has a clear return-to-globe control.
- Country and region weather panel behavior remains intact.
- The globe does not try to render roads, terrain, or city labels itself.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Defer tile source and API-key requirements to a follow-up decision
- [x] Create Step 020 branch
- [x] Add map mode type/state
- [x] Add regional map component scaffold
- [x] Add mode transition trigger
- [x] Center regional map from selected country/region
- [x] Preserve weather panel selection behavior
- [x] Add return-to-globe control
- [ ] Verify responsive layout
- [x] Verify lint/build
- [x] Commit Step 020 changes when implementation stabilizes
