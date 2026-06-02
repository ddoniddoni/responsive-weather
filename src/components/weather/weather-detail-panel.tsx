import { WeatherMetricCard } from "@/components/weather/weather-metric-card";
import { WeatherReactiveButton } from "@/components/weather/weather-reactive-button";
import type { WeatherData } from "@/types/weather-data";

type WeatherDetailPanelProps = {
  weather: WeatherData | null;
  theme: "light" | "dark";
};

export function WeatherDetailPanel({ weather, theme }: WeatherDetailPanelProps) {
  if (!weather) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weather Detail</h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          지도를 클릭해서 국가를 선택하면 상세 날씨가 여기에 표시됩니다.
        </p>
      </aside>
    );
  }

  const title = weather.regionName ?? weather.countryName;
  const subtitle = weather.regionName ? `${weather.countryName} / ${weather.regionCode}` : weather.countryCode;
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
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <WeatherReactiveButton condition={weather.condition} theme={theme}>
          {weather.condition}
        </WeatherReactiveButton>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{weather.description}</p>
      <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
