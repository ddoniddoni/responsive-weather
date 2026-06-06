# STEP-011: Detail panel copy cleanup

## Goal

- Replace garbled visible copy in the weather detail panel with readable labels.
- Improve accessibility labels without changing weather data behavior.

## Scope

- Clean empty-state text in `WeatherDetailPanel`.
- Clean metric labels and helper text.
- Clean update and close-button labels.
- Keep layout, styling, and data flow unchanged.

## Completion Criteria

- Weather detail panel no longer shows garbled copy in its main labels.
- Icon/button aria labels are readable.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 011 branch
- [x] Write Step 011 plan
- [x] Clean detail panel empty-state copy
- [x] Clean metric and update labels
- [x] Clean close-button aria label
- [x] Run lint/build verification
- [x] Commit and push Step 011 branch
