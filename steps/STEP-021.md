# STEP-021: Product-grade visual system refresh

## Goal

- Move the weather dashboard away from a playful prototype look and toward a sellable software interface.
- Establish a more mature visual direction for typography, color, spacing, cards, controls, and weather-reactive UI.

## Scope

- Replace default app metadata and base font setup.
- Refine global light/dark color tokens and body typography.
- Redesign the dashboard header, theme toggle, map frame, weather panel, metrics, and insights.
- Reduce overly playful colors, gradients, large border radii, and decorative animation intensity.
- Fix broken visible copy and weather unit rendering.
- Keep existing map, selection, regional detail, and mock data behavior intact.

## Out of Scope

- Real weather API integration.
- New UI libraries or package manager changes.
- Authentication, database, saved locations, or monetization features.
- Large architecture refactors unrelated to the visual refresh.

## Completion Criteria

- The main dashboard presents as a restrained product UI on desktop and mobile.
- Typography uses the configured Next.js font instead of browser-default Arial.
- Weather states remain visually distinct without dominating the interface.
- Light/dark mode remains available and consistent.
- Existing country and regional selection behavior is preserved.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 021 branch
- [x] Update metadata and font configuration
- [x] Refresh global colors, radius, and motion behavior
- [x] Redesign dashboard header and theme control
- [x] Redesign map frame and map controls
- [x] Redesign weather detail panel and metric cards
- [x] Refresh dashboard insight cards and mock weather copy
- [x] Verify responsive layout in browser
- [x] Run lint/build
- [x] Commit and push Step 021 branch
