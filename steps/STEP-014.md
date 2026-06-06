# STEP-014

## Goal

Make weather layer buttons affect the map surface with a lightweight heatmap-style layer, starting from normalized overlay point data.

## Scope

- Add precipitation to the Open-Meteo current overlay request and app overlay model.
- Render a non-interactive heat layer for temperature, feels-like, precipitation, radar, wind, clouds, pressure, and humidity.
- Keep compact markers and the detail panel as the interaction layer.
- Preserve mobile density limits and accessibility.

## Completion Criteria

- Selecting a layer changes the visible map color field.
- Temperature, feels-like, and precipitation use normalized app data where available.
- The heat layer does not block country or marker selection.
- Lint and build pass.

## Checklist

- [x] Extend overlay data with precipitation.
- [x] Add layer value/color mapping.
- [x] Render the map heat layer behind interactive markers.
- [x] Update docs.
- [x] Run lint and build.
