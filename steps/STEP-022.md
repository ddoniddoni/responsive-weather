# STEP-022: Map-first weather interface inspired by Ventusky

## Goal

- Reframe the app as a full-screen weather map product instead of a card-based dashboard.
- Use Ventusky as a structural reference for map density, floating controls, layer rail, legend, and timeline, without copying brand assets or exact UI.

## Scope

- Add a map-first home composition with the map as the primary first-viewport surface.
- Add floating top controls for brand, search affordance, location action, and theme mode.
- Add left-side weather layer controls.
- Add right-side scale/legend and compact mode controls.
- Add a bottom time rail for forecast preview.
- Convert selected weather detail into an overlay panel instead of a separate right column.
- Keep existing globe, regional map, country selection, regional selection, mock weather, and theme behavior.

## Out of Scope

- Real Ventusky data, map tiles, wind particles, radar data, or forecast API integration.
- Copying Ventusky branding, icons, exact layout, or proprietary design.
- New dependencies or package manager changes.
- Authentication, premium plans, saved places, or accounts.

## Completion Criteria

- The first screen reads as a weather map application, not a card dashboard.
- Mobile layout keeps controls reachable without horizontal overflow.
- Existing country and region selection continue to populate weather detail.
- Light/dark theme still works.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 022 branch
- [x] Add Step 022 plan
- [x] Build map-first dashboard shell
- [x] Add layer rail, legend, and timeline controls
- [x] Convert weather panel into floating map overlay
- [x] Verify responsive layout
- [x] Run lint/build
- [x] Commit and push Step 022 branch
