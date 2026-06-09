# STEP-033

## Goal

Restore core map interactions after viewport constraints caused the MapLibre canvas to fail or feel locked.

## Scope

- Remove MapLibre bounds settings that can break tile initialization or over-constrain panning.
- Keep `renderWorldCopies: false` to prevent repeated world rendering.
- Keep the single-world fallback backdrop from the previous step.
- Preserve zoom limits only at a light, interaction-friendly level.

## Completion Criteria

- The map canvas initializes without runtime errors.
- Drag and zoom controls work again.
- The same world copy is not repeated by MapLibre.
- Lint and build pass.

## Checklist

- [x] Remove brittle map bounds constraints.
- [x] Keep world-copy prevention and fallback visibility.
- [x] Run lint and build.
