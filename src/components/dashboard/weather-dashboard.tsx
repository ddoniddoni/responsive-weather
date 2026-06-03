"use client";

import { useEffect, useMemo, useState } from "react";

import { ForecastTimeline } from "@/components/dashboard/forecast-timeline";
import { MapTopBar } from "@/components/dashboard/map-top-bar";
import { WeatherLayerRail } from "@/components/dashboard/weather-layer-rail";
import { WeatherScaleLegend } from "@/components/dashboard/weather-scale-legend";
import { WorldMap } from "@/components/map/world-map";
import { WeatherDetailPanel } from "@/components/weather/weather-detail-panel";
import { FORECAST_TIMES, WEATHER_LAYERS } from "@/constants/weather-layers";
import { getMockWeatherByCountry, getMockWeatherByRegion } from "@/lib/weather/mock-weather";
import type { SelectedCountry, SelectedRegion } from "@/types/weather-data";

export function WeatherDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  const [activeLayer, setActiveLayer] = useState(WEATHER_LAYERS[0]);
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

  const selectedLabel = weather?.regionName ?? weather?.countryName ?? "지도에서 지역을 선택하세요";

  function handleSelectCountry(country: SelectedCountry) {
    setSelectedCountry(country);
    setSelectedRegion(null);
  }

  return (
    <div
      className={`relative h-screen min-h-[680px] max-w-full overflow-hidden transition-colors ${
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

      <MapTopBar
        activeLayer={activeLayer}
        activeTimeLabel={FORECAST_TIMES[activeTime]}
        isDark={isDark}
        selectedLabel={selectedLabel}
        onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
      />
      <WeatherLayerRail activeLayer={activeLayer} layers={WEATHER_LAYERS} onSelectLayer={setActiveLayer} />
      <WeatherScaleLegend activeLayer={activeLayer} />
      <ForecastTimeline activeTime={activeTime} times={FORECAST_TIMES} onSelectTime={setActiveTime} />

      <div className="absolute bottom-24 left-3 z-20 w-[calc(100vw-1.5rem)] min-w-0 md:bottom-24 md:left-auto md:right-4 md:w-[390px]">
        <WeatherDetailPanel weather={weather} theme={theme} variant="overlay" />
      </div>
    </div>
  );
}
