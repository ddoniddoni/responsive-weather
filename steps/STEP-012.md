# STEP-012: Map control copy cleanup

## Goal

- Replace garbled map control and map status copy with readable text.
- Improve accessibility labels for map interactions.

## Scope

- Clean admin-boundary status messages.
- Clean map zoom/reset aria labels.
- Clean selected-country regional detail aria label.
- Clean non-immersive map helper copy.
- Preserve all map behavior and styling.

## Completion Criteria

- Map controls and statuses use readable text.
- Keyboard and screen-reader labels are clear.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 012 branch
- [x] Write Step 012 plan
- [x] Clean admin-boundary status copy
- [x] Clean map control aria labels
- [x] Clean map helper/status copy
- [x] Run lint/build verification
- [x] Commit and push Step 012 branch
