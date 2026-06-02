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
    <div className={`min-h-screen p-4 transition-colors md:p-6 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
      <header className="mx-auto mb-4 flex w-full max-w-7xl items-center justify-between gap-3">
        <h1 className={`text-xl font-bold md:text-2xl ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Responsive Weather
        </h1>
        <button
          type="button"
          aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-base transition-colors ${
            isDark
              ? "border-slate-600 text-slate-100 hover:bg-slate-700"
              : "border-slate-300 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span aria-hidden="true">{isDark ? "☀" : "🌙"}</span>
          <span className="sr-only">{isDark ? "Light mode" : "Dark mode"}</span>
        </button>
      </header>
      <main
        className={`mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 ${
          selectedCountry ? "lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]" : ""
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
