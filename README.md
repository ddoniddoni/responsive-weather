# Responsive Weather

Responsive Weather is a Next.js app for exploring weather through a map-first interface. The current UI is inspired by the structure of Ventusky, with more focus on the map, weather layers, time navigation, and the detail overlay than on traditional dashboard cards.

## Key Features

- 2D globe-based country selection
- Weather detail overlay for the selected country or region
- ADM1 regional selection support
- Weather layer switching
- Forecast timeline controls
- Light and dark mode
- Mock weather data for UI states
- Responsive layout for desktop and mobile

## Screen Layout

- `Map`: the main surface. Drag to rotate and use the zoom buttons to adjust the view.
- `Layers`: switch between temperature, feels like, precipitation, radar, wind, clouds, pressure, and humidity.
- `Timeline`: a compact forecast scrubber near the bottom of the screen.
- `Detail Panel`: shows the current weather for the selected country or region.

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- React Simple Maps
- d3-geo
- npm

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

On Windows PowerShell, use `npm.cmd` if `npm run ...` is blocked.

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

## Verification

```bash
npm run lint
npm run build
```

## Project Structure

- `src/app/`: App Router pages and the root layout
- `src/components/dashboard/`: map-first dashboard composition
- `src/components/map/`: map and region selection components
- `src/components/weather/`: weather detail panel and reactive UI pieces
- `src/constants/`: shared constants such as weather layers and time labels
- `src/lib/weather/`: mock weather data
- `src/types/`: shared TypeScript types
- `steps/`: step-based planning documents

## Current State

- The current screen is intentionally map-first instead of card-first.
- There is no real weather API, saved places, or account system yet.
- The UI still uses mock data so we can keep iterating on layout and interaction first.
