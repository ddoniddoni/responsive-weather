# STEP-024: Location search selection

## Goal

- Turn the top map search affordance into a working location search control.
- Let users quickly select supported mock-weather countries without manually rotating the globe.
- Keep the implementation local and API-free so the app remains stable before real weather integration.

## Scope

- Add a small searchable country catalog for current mock-weather locations.
- Replace the passive selected-location label in the top bar with a controlled search input.
- Show keyboard-accessible search results for supported countries.
- Connect search selection to the existing selected country, weather panel, and map focus flow.
- Preserve current map click, regional detail, weather layer, timeline, and theme behavior.

## Out of Scope

- Real weather API integration.
- City search, autocomplete from external providers, or geocoding.
- Favorites, recent searches, accounts, or persisted user settings.
- Adding new dependencies or changing package manager.

## Completion Criteria

- Users can search and select a supported country from the top bar.
- Selecting a search result updates the weather detail overlay.
- Selecting a search result focuses the globe on that country.
- Search controls remain usable on mobile without horizontal overflow.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 024 branch
- [x] Add Step 024 plan
- [x] Add searchable country constants/types
- [x] Implement top bar search interaction
- [x] Connect search selection to dashboard and map focus
- [x] Verify responsive layout
- [x] Run lint/build
- [x] Commit and push Step 024 branch
