# STEP-008: Mobile overlay density

## Goal

- Keep realtime weather overlay markers useful on mobile without covering too much of the map.
- Preserve full overlay exploration on tablet and desktop.

## Scope

- Detect compact mobile viewports in the map component.
- Limit visible overlay markers on mobile at low zoom levels.
- Keep all overlay points available again when users zoom in.
- Slightly reduce marker label footprint on small screens.

## Completion Criteria

- Mobile low-zoom map shows a smaller curated overlay marker set.
- Desktop and tablet overlay marker behavior remains unchanged.
- Zoomed mobile map can show the complete overlay point set.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 008 branch
- [x] Write Step 008 plan
- [x] Add compact viewport detection
- [x] Filter mobile low-zoom overlay markers
- [x] Add mobile marker footprint CSS
- [x] Run lint/build verification
- [x] Commit and push Step 008 branch
