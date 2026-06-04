# STEP-025: Commercial search experience

## Goal

- Make the location search feel like a production-grade weather map control.
- Improve keyboard access, clear states, and result presentation without adding dependencies.
- Keep the search experience honest about the currently supported mock-weather locations.

## Scope

- Add keyboard navigation for the top location search.
- Add highlighted search result state and Enter/Escape behavior.
- Add a clear search action and selected-location context.
- Improve empty state and supported-location messaging.
- Preserve the existing map, weather panel, layer rail, timeline, and theme behavior.

## Out of Scope

- Real weather API integration.
- External geocoding, city search, or unlimited country search.
- Persisted recent searches, accounts, favorites, or analytics.
- New dependencies or package manager changes.

## Completion Criteria

- Users can navigate search results with keyboard and mouse.
- Enter selects the highlighted result and Escape closes the menu.
- The search can be cleared without losing the selected weather panel.
- Empty state clearly explains the supported mock search scope.
- Mobile layout avoids horizontal overflow.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 025 branch
- [x] Add Step 025 plan
- [x] Add keyboard navigation and highlighted result state
- [x] Add clear action and selected-location context
- [x] Improve empty and supported-location states
- [x] Verify responsive layout
- [x] Run lint/build
- [x] Commit and push Step 025 branch
