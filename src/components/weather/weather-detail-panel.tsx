import { WeatherMetricCard } from "@/components/weather/weather-metric-card";
import { WeatherReactiveButton } from "@/components/weather/weather-reactive-button";
import type { WeatherData } from "@/types/weather-data";

type WeatherDetailPanelProps = {
  weather: WeatherData | null;
  theme: "light" | "dark";
  variant?: "panel" | "overlay";
};

export function WeatherDetailPanel({ weather, theme, variant = "panel" }: WeatherDetailPanelProps) {
  const isOverlay = variant === "overlay";
  const panelClassName = isOverlay
    ? "rounded-2xl border border-white/70 bg-white/94 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88"
    : "rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950";

  if (!weather) {
    return (
      <aside className={panelClassName}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Forecast Detail
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">Select a location</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Choose a country on the map to review temperature, wind, humidity, and condition-specific interface states.
        </p>
      </aside>
    );
  }

  const title = weather.regionName ?? weather.countryName;
  const subtitle = weather.regionName ? `${weather.countryName} / ${weather.regionCode}` : weather.countryCode;
  const updatedAt = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  const metricCards = [
    {
      label: "Temperature",
      value: `${weather.temperature}°C`,
      helperText: "Current air temperature",
    },
    {
      label: "Feels Like",
      value: `${weather.feelsLike}°C`,
      helperText: "Perceived outdoor comfort",
    },
    {
      label: "Humidity",
      value: `${weather.humidity}%`,
      helperText: "Moisture level in the air",
    },
    {
      label: "Wind",
      value: `${weather.windSpeed} m/s`,
      helperText: "Surface wind speed",
    },
  ];

  return (
    <aside className={panelClassName}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Weather Detail
          </p>
          <h2 className="mt-2 truncate text-xl font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <WeatherReactiveButton condition={weather.condition} theme={theme}>
          {weather.condition}
        </WeatherReactiveButton>
      </div>
      <div className="mt-4 border-y border-slate-200 py-4 dark:border-slate-800">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Current
            </p>
            <p className="mt-2 font-mono text-5xl font-semibold leading-none tracking-normal text-slate-950 dark:text-white">
              {weather.temperature}°C
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Updated</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{updatedAt}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{weather.description}</p>
      </div>
      <dl className={`mt-4 grid grid-cols-1 gap-3 text-sm ${isOverlay ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"}`}>
        {metricCards.map((metricCard) => (
          <WeatherMetricCard
            key={metricCard.label}
            condition={weather.condition}
            label={metricCard.label}
            value={metricCard.value}
            helperText={metricCard.helperText}
            theme={theme}
          />
        ))}
      </dl>
    </aside>
  );
}
