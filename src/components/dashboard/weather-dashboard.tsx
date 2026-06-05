"use client";

import { useEffect, useMemo, useState } from "react";

import { ForecastTimeline } from "@/components/dashboard/forecast-timeline";
import { MapTopBar } from "@/components/dashboard/map-top-bar";
import { MobileWeatherSheet } from "@/components/dashboard/mobile-weather-sheet";
import { WeatherLayerRail } from "@/components/dashboard/weather-layer-rail";
import { WeatherScaleLegend } from "@/components/dashboard/weather-scale-legend";
import { WorldMap } from "@/components/map/world-map";
import { WeatherDetailPanel } from "@/components/weather/weather-detail-panel";
import { SEARCHABLE_LOCATIONS, type SearchableLocation } from "@/constants/searchable-locations";
import { WEATHER_OVERLAY_POINTS } from "@/constants/weather-overlay-points";
import { FORECAST_TIMES, WEATHER_LAYERS } from "@/constants/weather-layers";
import { getMockWeatherByCountry, getMockWeatherByRegion } from "@/lib/weather/mock-weather";
import type { SelectedCountry, SelectedRegion, WeatherOverlayPoint } from "@/types/weather-data";

type WeatherOverlayApiResponse = {
  data?: WeatherOverlayPoint[];
  error?: string;
};

type WeatherOverlayLoadStatus = "loading" | "success" | "error" | "empty";

export function WeatherDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  const [activeLayer, setActiveLayer] = useState(WEATHER_LAYERS[0]);
  const [activeTime, setActiveTime] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isMobileWeatherOpen, setIsMobileWeatherOpen] = useState(false);
  const [isWeatherOverlayVisible, setIsWeatherOverlayVisible] = useState(true);
  const [weatherOverlayPoints, setWeatherOverlayPoints] = useState<WeatherOverlayPoint[]>(WEATHER_OVERLAY_POINTS);
  const [weatherOverlayLoadStatus, setWeatherOverlayLoadStatus] =
    useState<WeatherOverlayLoadStatus>("loading");
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadWeatherOverlayPoints() {
      setWeatherOverlayLoadStatus("loading");

      try {
        const response = await fetch("/api/weather-overlay", {
          signal: abortController.signal,
        });
        const payload = (await response.json()) as WeatherOverlayApiResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "날씨 오버레이 데이터를 불러오지 못했습니다.");
        }

        if (!payload.data || payload.data.length === 0) {
          setWeatherOverlayLoadStatus("empty");
          return;
        }

        setWeatherOverlayPoints(payload.data);
        setWeatherOverlayLoadStatus("success");
      } catch {
        if (abortController.signal.aborted) {
          return;
        }

        setWeatherOverlayPoints(WEATHER_OVERLAY_POINTS);
        setWeatherOverlayLoadStatus("error");
      }
    }

    loadWeatherOverlayPoints();

    return () => abortController.abort();
  }, []);

  const weather = useMemo(() => {
    if (selectedRegion) {
      return getMockWeatherByRegion(selectedRegion);
    }

    if (!selectedCountry) {
      return null;
    }

    return getMockWeatherByCountry(selectedCountry.code, selectedCountry.name);
  }, [selectedCountry, selectedRegion]);

  const selectedLabel = weather?.regionName ?? weather?.countryName ?? "국가를 검색하거나 지도에서 선택하세요";

  function handleSelectCountry(country: SelectedCountry) {
    setSelectedCountry(country);
    setSelectedRegion(null);
    setSearchValue(country.name);
    setIsMobileWeatherOpen(true);
  }

  function handleSelectRegion(region: SelectedRegion) {
    setSelectedRegion(region);
    setIsMobileWeatherOpen(true);
  }

  function handleSelectSearchLocation(location: SearchableLocation) {
    handleSelectCountry({
      code: location.code,
      name: location.name,
      coordinates: location.coordinates,
    });
  }

  function handleSelectWeatherOverlayPoint(point: WeatherOverlayPoint) {
    handleSelectCountry({
      code: point.countryCode,
      name: point.countryName,
      coordinates: [point.longitude, point.latitude],
    });
  }

  function handleClearWeatherSelection() {
    setSelectedCountry(null);
    setSelectedRegion(null);
    setSearchValue("");
    setIsMobileWeatherOpen(false);
  }

  const weatherOverlayStatusLabel =
    isWeatherOverlayVisible && weatherOverlayLoadStatus === "loading"
      ? "실시간 날씨 불러오는 중"
      : isWeatherOverlayVisible && weatherOverlayLoadStatus === "error"
        ? "실시간 연결 실패, mock 데이터 표시 중"
        : isWeatherOverlayVisible && weatherOverlayLoadStatus === "empty"
          ? "표시할 실시간 날씨 없음"
          : null;

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
        selectedCountryCoordinates={selectedCountry?.coordinates ?? null}
        selectedRegionCode={selectedRegion?.regionCode ?? null}
        selectedWeatherCondition={weather?.condition ?? null}
        weatherOverlayPoints={weatherOverlayPoints}
        isWeatherOverlayVisible={isWeatherOverlayVisible}
        weatherOverlayStatusLabel={weatherOverlayStatusLabel}
        variant="immersive"
        onSelectCountry={handleSelectCountry}
        onSelectRegion={handleSelectRegion}
        onSelectWeatherOverlayPoint={handleSelectWeatherOverlayPoint}
        onToggleWeatherOverlay={() => setIsWeatherOverlayVisible((isVisible) => !isVisible)}
      />

      <MapTopBar
        isDark={isDark}
        searchLocations={SEARCHABLE_LOCATIONS}
        searchValue={searchValue}
        selectedLabel={selectedLabel}
        onSearchValueChange={setSearchValue}
        onSelectSearchLocation={handleSelectSearchLocation}
        onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
      />
      <WeatherLayerRail activeLayer={activeLayer} layers={WEATHER_LAYERS} onSelectLayer={setActiveLayer} />
      <WeatherScaleLegend activeLayer={activeLayer} />
      <ForecastTimeline activeTime={activeTime} times={FORECAST_TIMES} onSelectTime={setActiveTime} />

      <MobileWeatherSheet
        weather={weather}
        theme={theme}
        isOpen={isMobileWeatherOpen}
        onToggleOpen={() => setIsMobileWeatherOpen((isOpen) => !isOpen)}
      />

      {weather ? (
        <div className="absolute right-4 top-28 z-20 hidden w-[390px] max-w-[calc(100vw-2rem)] min-w-0 md:block">
          <WeatherDetailPanel
            weather={weather}
            theme={theme}
            variant="overlay"
            onClose={handleClearWeatherSelection}
          />
        </div>
      ) : null}
    </div>
  );
}
