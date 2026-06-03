"use client";

import { useEffect, useMemo, useState } from "react";

import { WorldMap } from "@/components/map/world-map";
import { WeatherDetailPanel } from "@/components/weather/weather-detail-panel";
import { getMockWeatherByCountry, getMockWeatherByRegion } from "@/lib/weather/mock-weather";
import type { SelectedCountry, SelectedRegion } from "@/types/weather-data";

type WeatherLayer = {
  id: "temperature" | "feels-like" | "precipitation" | "radar" | "wind" | "clouds" | "pressure" | "humidity";
  label: string;
  unit: string;
};

const WEATHER_LAYERS: WeatherLayer[] = [
  { id: "temperature", label: "Temperature", unit: "°C" },
  { id: "feels-like", label: "Feels like", unit: "°C" },
  { id: "precipitation", label: "Precipitation", unit: "mm" },
  { id: "radar", label: "Radar", unit: "dBZ" },
  { id: "wind", label: "Wind", unit: "m/s" },
  { id: "clouds", label: "Clouds", unit: "%" },
  { id: "pressure", label: "Pressure", unit: "hPa" },
  { id: "humidity", label: "Humidity", unit: "%" },
];

const FORECAST_TIMES = ["Now", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
const TEMPERATURE_SCALE = [40, 35, 30, 25, 20, 15, 10, 5, 0, -5, -10];

export function WeatherDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>(WEATHER_LAYERS[0]);
  const [activeTime, setActiveTime] = useState(0);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const weather = useMemo(() => {
    if (selectedRegion) {
      return getMockWeatherByRegion(selectedRegion);
    }

    if (!selectedCountry) {
      return null;
    }

    return getMockWeatherByCountry(selectedCountry.code, selectedCountry.name);
  }, [selectedCountry, selectedRegion]);

  const selectedLabel = weather?.regionName ?? weather?.countryName ?? "Search or select on map";

  function handleSelectCountry(country: SelectedCountry) {
    setSelectedCountry(country);
    setSelectedRegion(null);
  }

  return (
    <div
      className={`relative h-screen min-h-[720px] overflow-hidden transition-colors ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-950"
      }`}
    >
      <WorldMap
        activeLayerId={activeLayer.id}
        selectedCountryCode={selectedCountry?.code ?? null}
        selectedCountryName={selectedCountry?.name ?? null}
        selectedRegionCode={selectedRegion?.regionCode ?? null}
        selectedWeatherCondition={weather?.condition ?? null}
        variant="immersive"
        onSelectCountry={handleSelectCountry}
        onSelectRegion={setSelectedRegion}
      />

      <header className="pointer-events-none absolute inset-x-3 top-3 z-30 flex flex-col gap-2 md:inset-x-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-2 md:flex-1 md:flex-row md:items-center">
          <div className="pointer-events-auto flex items-center justify-between gap-2 md:block">
            <div className="flex h-12 shrink-0 items-center gap-2 rounded-full border border-white/75 bg-white/94 px-4 text-slate-950 shadow-lg shadow-slate-950/12 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-sm font-black text-white">
              W
            </div>
            <span className="hidden text-lg font-extrabold tracking-normal min-[420px]:block">Responsive Weather</span>
            </div>
            <button
              type="button"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="h-12 rounded-full border border-white/75 bg-white/94 px-5 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/12 backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-100 dark:hover:bg-slate-900 md:hidden"
            >
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
          <label className="pointer-events-auto flex h-12 w-full min-w-0 max-w-full flex-1 items-center gap-3 rounded-full border border-white/75 bg-white/94 px-4 text-sm text-slate-500 shadow-lg shadow-slate-950/12 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-400 md:max-w-[460px]">
            <span aria-hidden="true" className="text-base">
              +
            </span>
            <span className="truncate">{selectedLabel}</span>
            <span className="ml-auto rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              Locate
            </span>
          </label>
        </div>
        <div className="pointer-events-auto hidden items-center gap-2 self-start md:flex md:self-auto">
          <div className="hidden rounded-full border border-white/75 bg-white/94 px-4 py-3 text-xs font-semibold text-slate-700 shadow-lg shadow-slate-950/12 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-200 sm:block">
            {activeLayer.label} · {FORECAST_TIMES[activeTime]}
          </div>
          <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-12 rounded-full border border-white/75 bg-white/94 px-5 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/12 backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <aside className="absolute left-3 right-3 top-32 z-20 flex gap-2 overflow-x-auto rounded-2xl border border-white/70 bg-slate-950/70 p-2 shadow-xl shadow-slate-950/18 backdrop-blur md:left-4 md:right-auto md:top-24 md:max-h-[calc(100vh-15rem)] md:w-48 md:flex-col md:overflow-y-auto">
        {WEATHER_LAYERS.map((layer) => {
          const isActive = activeLayer.id === layer.id;

          return (
            <button
              key={layer.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveLayer(layer)}
              className={`flex h-10 min-w-36 items-center justify-between rounded-xl px-3 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 md:min-w-0 ${
                isActive
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-white/88 hover:bg-white/12"
              }`}
            >
              <span>{layer.label}</span>
              <span className={`font-mono text-[11px] ${isActive ? "text-blue-700" : "text-white/58"}`}>
                {layer.unit}
              </span>
            </button>
          );
        })}
      </aside>

      <aside className="absolute bottom-32 right-3 z-20 hidden w-16 flex-col items-center gap-2 md:flex">
        <div className="overflow-hidden rounded-xl border border-white/80 bg-white/92 text-center text-xs font-semibold text-slate-900 shadow-xl shadow-slate-950/18 backdrop-blur dark:border-slate-700 dark:bg-slate-950/88 dark:text-slate-100">
          <div className="px-3 py-2 font-mono text-[11px]">{activeLayer.unit}</div>
          {TEMPERATURE_SCALE.map((value, index) => (
            <div
              key={value}
              className="px-3 py-1 font-mono"
              style={{
                backgroundColor: `hsl(${220 - index * 22} 76% 58%)`,
                color: index > 6 ? "#f8fafc" : "#0f172a",
              }}
            >
              {value}
            </div>
          ))}
        </div>
      </aside>

      <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/20 bg-slate-950/72 px-3 py-3 text-white shadow-[0_-16px_40px_rgba(15,23,42,0.28)] backdrop-blur md:px-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center">
          <button
            type="button"
            aria-label="Previous forecast time"
            onClick={() => setActiveTime((time) => Math.max(0, time - 1))}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 font-mono text-sm font-semibold transition-colors hover:bg-white/18 md:inline-flex"
          >
            &lt;
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
            {FORECAST_TIMES.map((time, index) => (
              <button
                key={time}
                type="button"
                aria-pressed={activeTime === index}
                onClick={() => setActiveTime(index)}
                className={`h-11 min-w-20 rounded-full px-4 font-mono text-sm font-semibold transition-colors ${
                  activeTime === index ? "bg-white text-blue-700" : "bg-white/10 text-white hover:bg-white/18"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Next forecast time"
            onClick={() => setActiveTime((time) => Math.min(FORECAST_TIMES.length - 1, time + 1))}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 font-mono text-sm font-semibold transition-colors hover:bg-white/18 md:inline-flex"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="absolute bottom-24 left-3 right-3 z-20 md:bottom-24 md:left-auto md:right-4 md:w-[390px]">
        <WeatherDetailPanel weather={weather} theme={theme} variant="overlay" />
      </div>
    </div>
  );
}
