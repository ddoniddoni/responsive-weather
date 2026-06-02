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

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <WeatherReactiveButton condition={weather.condition} theme={theme}>
          {weather.condition}
        </WeatherReactiveButton>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{weather.description}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-300">Temperature</dt>
          <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{weather.temperature}°C</dd>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-300">Feels Like</dt>
          <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{weather.feelsLike}°C</dd>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-300">Humidity</dt>
          <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{weather.humidity}%</dd>
        </div>
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
          <dt className="text-slate-500 dark:text-slate-300">Wind</dt>
          <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{weather.windSpeed} m/s</dd>
        </div>
      </dl>
    </aside>
  );
}
