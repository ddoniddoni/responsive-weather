# STEP-018

## Goal

Reduce realtime weather overlay visuals so markers and heat spots do not cover the map.

## Scope

- Scale weather heat spot radius against the current map zoom.
- Scale overlay markers against the current map zoom.
- Keep overlay selection, labels, and accessibility behavior intact.

## Completion Criteria

- Weather heat spots remain compact while zoomed in.
- Weather markers do not block nearby country shapes.
- Lint and build pass.

## Checklist

- [x] Reduce heat layer visual size.
- [x] Reduce overlay marker visual size.
- [x] Run lint and build.
