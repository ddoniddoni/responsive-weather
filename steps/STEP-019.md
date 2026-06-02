# STEP-019: Country forecast expansion plan

## Goal

- Expand the selected-country weather panel from current conditions into hourly and weekly forecast views.
- Keep forecast data normalized so mock data can be replaced by a real weather API later.

## Scope

- Define forecast types for hourly and daily weather data.
- Add mock forecast data by country, with deterministic fallback data for countries without hand-written entries.
- Add forecast normalization helpers that match the future real API boundary.
- Extend the detail panel with forecast sections or tabs after the current conditions summary.
- Preserve the responsive dashboard layout on mobile, tablet, and desktop.

## Data Model Draft

```ts
type HourlyForecast = {
  time: string;
  temperature: number;
  condition: WeatherCondition;
  precipitationChance?: number;
  windSpeed?: number;
};

type DailyForecast = {
  date: string;
  highTemperature: number;
  lowTemperature: number;
  condition: WeatherCondition;
  precipitationChance?: number;
};

type WeatherForecast = {
  countryCode: string;
  regionCode?: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
};
```

## Suggested UI Direction

- Add compact tabs or segmented controls for `Now`, `Hourly`, and `Week`.
- Show hourly forecast as a horizontally scrollable row on mobile and a dense grid on desktop.
- Show weekly forecast as a compact seven-day list with condition, high/low temperature, and precipitation chance.
- Keep weather condition effects decorative and behind readable text.

## Completion Criteria

- Country selection shows current weather plus hourly and weekly forecast affordances.
- Forecast components handle empty and fallback data.
- UI remains readable in cloudy/rainy/sunny variants.
- `npm run lint` and `npm run build` pass.

## Checklist

- [ ] Create Step 019 branch
- [ ] Add forecast TypeScript types
- [ ] Add mock hourly and weekly forecast data
- [ ] Add forecast helper functions
- [ ] Extend weather detail panel UI
- [ ] Verify responsive layout
- [ ] Verify lint/build
- [ ] Commit and push Step 019 branch
