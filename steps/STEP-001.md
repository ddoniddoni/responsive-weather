# STEP-001: Realtime weather overlay requirements

## Goal

- Redefine the map experience so the globe can show realtime weather signals directly.
- Keep the existing selected-location weather panel, but add an explicit weather overlay mode for the globe.
- Define the API, data flow, UI boundaries, and completion criteria before implementation.

## Scope

- Update the product requirements to allow realtime weather markers or lightweight visual layers on the globe.
- Keep Open-Meteo as the preferred weather API for the first realtime implementation.
- Define representative weather points using country or city coordinates instead of fetching every country at once.
- Normalize API responses before rendering them on the globe or in the weather panel.
- Add loading, error, empty, and refresh-state requirements for overlay data.
- Require a user-visible overlay toggle so the map can still be used as a clean selection surface.

## Out of Scope

- Implementing the realtime overlay UI in this step.
- Adding paid weather providers, API keys, authentication, database storage, or user accounts.
- Rendering full radar tiles, satellite imagery, severe-alert polygons, or high-density forecast layers.
- Polling every country or region continuously.
- Changing the package manager or core Next.js, TypeScript, Tailwind CSS, and shadcn/ui stack.

## Completion Criteria

- `PRD.md` documents realtime globe weather overlay as a supported product direction.
- `AGENTS.md` documents the overlay-mode exception to the previous no-weather-on-map rule.
- `README.md` summarizes the realtime overlay direction for project readers.
- Outdated pre-overlay Step documents are removed to keep the current product direction clear.
- The first implementation target is clear: Open-Meteo current weather by representative coordinates.
- The Step document defines boundaries that protect performance, accessibility, and API usage.
- Documentation changes are reviewed with `git diff`.

## Checklist

- [x] Create Step 001 branch
- [x] Add Step 001 plan
- [x] Update PRD requirements
- [x] Update AGENTS map rules
- [x] Update README overview
- [x] Remove outdated pre-overlay Step documents
- [x] Review documentation diff
- [x] Commit and push Step 001 branch
