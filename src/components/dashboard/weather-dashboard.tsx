"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardInsights } from "@/components/dashboard/dashboard-insights";
import { WorldMap } from "@/components/map/world-map";
import { WeatherDetailPanel } from "@/components/weather/weather-detail-panel";
import { getMockWeatherByCountry, getMockWeatherByRegion } from "@/lib/weather/mock-weather";
import type { SelectedCountry, SelectedRegion } from "@/types/weather-data";

export function WeatherDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
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

  function handleSelectCountry(country: SelectedCountry) {
    setSelectedCountry(country);
    setSelectedRegion(null);
  }

  return (
    <div
      className={`min-h-screen overflow-x-hidden p-3 transition-colors sm:p-4 lg:p-6 ${
        isDark ? "bg-[#070a12] text-slate-100" : "bg-[#f4f6f8] text-slate-950"
      }`}
    >
      <header className="mx-auto mb-4 flex w-full max-w-7xl min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.16em] ${
              isDark ? "text-cyan-200" : "text-cyan-800"
            }`}
          >
            Weather Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-pretty md:text-3xl">
            Responsive Weather
          </h1>
          <p className={`mt-1 max-w-2xl text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Explore global conditions, focus a country, and review regional mock weather from a single responsive
            workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`hidden rounded-md border px-3 py-2 text-xs font-medium sm:block ${
              isDark
                ? "border-slate-800 bg-slate-950/60 text-slate-300"
                : "border-slate-200 bg-white/80 text-slate-600"
            }`}
          >
            {weather ? `${weather.countryCode} / ${weather.condition}` : "No location selected"}
          </div>
          <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`inline-flex h-10 items-center justify-center rounded-md border px-3 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </header>
      <main
        className={`mx-auto grid w-full max-w-7xl min-w-0 grid-cols-1 gap-3 ${
          selectedCountry ? "lg:grid-cols-[minmax(0,1fr)_minmax(340px,380px)]" : ""
        }`}
      >
        <WorldMap
          selectedCountryCode={selectedCountry?.code ?? null}
          selectedCountryName={selectedCountry?.name ?? null}
          selectedRegionCode={selectedRegion?.regionCode ?? null}
          selectedWeatherCondition={weather?.condition ?? null}
          onSelectCountry={handleSelectCountry}
          onSelectRegion={setSelectedRegion}
        />
        {selectedCountry ? <WeatherDetailPanel weather={weather} theme={theme} /> : null}
      </main>
      <DashboardInsights weather={weather} />
    </div>
  );
}
