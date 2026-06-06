# STEP-015

## Goal

Make the realtime weather overlay feel horizontally continuous by wrapping heat spots and compact markers along with the map.

## Scope

- Reuse the world repeat offsets for heat layer rendering.
- Render wrapped marker copies as visual-only elements.
- Keep only the center overlay markers interactive.
- Preserve accessible marker interaction on the primary map copy.

## Completion Criteria

- Panning toward the horizontal edges keeps heat colors visible on wrapped copies.
- Wrapped marker copies do not create duplicate tab stops.
- Primary overlay markers remain clickable and keyboard accessible.
- Lint and build pass.

## Checklist

- [x] Support visual-only marker rendering.
- [x] Render heat layer for each wrapped world copy.
- [x] Render non-interactive wrapped marker copies.
- [x] Update docs.
- [x] Run lint and build.
