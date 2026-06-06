# STEP-006: Overlay refresh status

## Goal

- Make realtime overlay freshness visible and controllable without adding a new provider or broad map changes.
- Let users manually refresh the curated Open-Meteo overlay points.

## Scope

- Read `source` and `updatedAt` from the existing overlay API response.
- Keep a conservative manual refresh action in the dashboard state.
- Show overlay freshness and fallback status near the map controls.
- Preserve existing overlay toggle, country selection, and detail-panel behavior.

## Completion Criteria

- The map displays a concise updated-time label when realtime overlay data loads.
- Users can manually refresh overlay data with a visible button.
- Loading, empty, and error statuses remain accessible and do not block map selection.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 006 branch
- [x] Write Step 006 plan
- [x] Track overlay source and updated time in dashboard state
- [x] Add manual overlay refresh action
- [x] Render refresh control and freshness status in the map
- [x] Run lint/build verification
- [x] Commit and push Step 006 branch
