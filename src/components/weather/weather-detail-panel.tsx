import { WeatherInsightStrip } from "@/components/weather/weather-insight-strip";
import { WeatherMetricCard } from "@/components/weather/weather-metric-card";
import { WeatherReactiveButton } from "@/components/weather/weather-reactive-button";
import { getWeatherInsights } from "@/lib/weather/weather-insights";
import type { WeatherData } from "@/types/weather-data";

type WeatherDetailPanelProps = {
  weather: WeatherData | null;
  theme: "light" | "dark";
  variant?: "panel" | "overlay";
  onClose?: () => void;
};

function formatUpdatedAt(updatedAt: string | undefined) {
  const updatedDate = updatedAt ? new Date(updatedAt) : new Date();

  return new Intl.DateTimeFormat("ko", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(Number.isNaN(updatedDate.getTime()) ? new Date() : updatedDate);
}

export function WeatherDetailPanel({ weather, theme, variant = "panel", onClose }: WeatherDetailPanelProps) {
  const isOverlay = variant === "overlay";
  const panelClassName = isOverlay
    ? "rounded-md border border-white/70 bg-white/94 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88"
    : "rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950";

  if (!weather) {
    return (
      <aside className={panelClassName}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Forecast Detail
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">Select a location</h2>
        <p className="mt-3 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
          Select a country, region, or realtime marker to inspect temperature, wind, humidity, and condition details.
        </p>
      </aside>
    );
  }

  const title = weather.regionName ?? weather.countryName;
  const subtitle = weather.regionName ? `${weather.countryName} / ${weather.regionCode}` : weather.countryCode;
  const sourceLabel = weather.sourceLabel ?? "Weather data";
  const updatedAt = formatUpdatedAt(weather.updatedAt);
  const temperatureText = `${weather.temperature}\u00b0C`;
  const insights = getWeatherInsights(weather);
  const metricCards = [
    {
      label: "Temperature",
      value: temperatureText,
      helperText: "Current air temperature",
    },
    {
      label: "Feels like",
      value: `${weather.feelsLike}\u00b0C`,
      helperText: "Perceived outdoor temperature",
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
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            <span className="inline-flex min-h-6 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {sourceLabel}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <WeatherReactiveButton condition={weather.condition} theme={theme}>
            {weather.condition}
          </WeatherReactiveButton>
          {onClose ? (
            <button
              type="button"
              aria-label="Close weather detail panel"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white/86 text-lg font-semibold leading-none text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:border-slate-700 dark:bg-slate-900/82 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              x
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-4 border-y border-slate-200 py-4 dark:border-slate-800">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Current
            </p>
            <p className="mt-2 font-mono text-5xl font-semibold leading-none tracking-normal text-slate-950 dark:text-white">
              {temperatureText}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Updated</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{updatedAt}</p>
          </div>
        </div>
        <p className="mt-4 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
          {weather.description}
        </p>
      </div>
      <div className="mt-4">
        <WeatherInsightStrip insights={insights} />
      </div>
      <dl
        className={`mt-4 grid grid-cols-1 gap-3 text-sm ${
          isOverlay ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
        }`}
      >
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
