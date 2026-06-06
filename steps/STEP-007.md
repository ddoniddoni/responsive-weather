# STEP-007: Weather overlay data hook

## Goal

- Move realtime overlay loading and refresh state out of the dashboard component.
- Keep the dashboard focused on selection and layout composition.

## Scope

- Add a `useWeatherOverlay` hook for overlay points, load status, source, updated time, and refresh.
- Preserve mock fallback behavior when the API fails.
- Keep selected overlay detail data in sync after refresh.
- Remove duplicated fetch handling from `WeatherDashboard`.

## Completion Criteria

- Dashboard uses the hook instead of owning overlay fetch state directly.
- Initial loading and manual refresh still use `/api/weather-overlay`.
- Selected overlay marker detail data updates when refreshed data contains the same point.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 007 branch
- [x] Write Step 007 plan
- [x] Add weather overlay hook
- [x] Replace dashboard overlay fetch state with hook usage
- [x] Preserve selected overlay point sync on refresh
- [x] Run lint/build verification
- [x] Commit and push Step 007 branch
