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
import { getWeatherFromOverlayPoint } from "@/lib/weather/overlay-weather";
import type { SelectedCountry, SelectedRegion, WeatherOverlayPoint } from "@/types/weather-data";

type WeatherOverlayApiResponse = {
  data?: WeatherOverlayPoint[];
  error?: string;
  source?: string;
  updatedAt?: string;
};

type WeatherOverlayLoadStatus = "loading" | "success" | "error" | "empty";

export function WeatherDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  const [selectedOverlayPoint, setSelectedOverlayPoint] = useState<WeatherOverlayPoint | null>(null);
  const [activeLayer, setActiveLayer] = useState(WEATHER_LAYERS[0]);
  const [activeTime, setActiveTime] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isMobileWeatherOpen, setIsMobileWeatherOpen] = useState(false);
  const [isWeatherOverlayVisible, setIsWeatherOverlayVisible] = useState(true);
  const [weatherOverlayPoints, setWeatherOverlayPoints] = useState<WeatherOverlayPoint[]>(WEATHER_OVERLAY_POINTS);
  const [weatherOverlayLoadStatus, setWeatherOverlayLoadStatus] =
    useState<WeatherOverlayLoadStatus>("loading");
  const [weatherOverlaySource, setWeatherOverlaySource] = useState("mock");
  const [weatherOverlayUpdatedAt, setWeatherOverlayUpdatedAt] = useState<string | null>(null);
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
          setWeatherOverlaySource(payload.source ?? "open-meteo");
          setWeatherOverlayUpdatedAt(payload.updatedAt ?? new Date().toISOString());
          return;
        }

        setWeatherOverlayPoints(payload.data);
        setSelectedOverlayPoint((currentPoint) =>
          currentPoint
            ? payload.data?.find((point) => point.id === currentPoint.id) ?? currentPoint
            : currentPoint,
        );
        setWeatherOverlaySource(payload.source ?? "open-meteo");
        setWeatherOverlayUpdatedAt(payload.updatedAt ?? new Date().toISOString());
        setWeatherOverlayLoadStatus("success");
      } catch {
        if (abortController.signal.aborted) {
          return;
        }

        setWeatherOverlayPoints(WEATHER_OVERLAY_POINTS);
        setWeatherOverlaySource("mock");
        setWeatherOverlayUpdatedAt(new Date().toISOString());
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

    if (selectedOverlayPoint) {
      return getWeatherFromOverlayPoint(selectedOverlayPoint);
    }

    if (!selectedCountry) {
      return null;
    }

    return getMockWeatherByCountry(selectedCountry.code, selectedCountry.name);
  }, [selectedCountry, selectedOverlayPoint, selectedRegion]);

  const selectedLabel = weather?.regionName ?? weather?.countryName ?? "국가를 검색하거나 지도에서 선택하세요";

  function handleSelectCountry(country: SelectedCountry) {
    setSelectedCountry(country);
    setSelectedRegion(null);
    setSelectedOverlayPoint(null);
    setSearchValue(country.name);
    setIsMobileWeatherOpen(true);
  }

  function handleSelectRegion(region: SelectedRegion) {
    setSelectedRegion(region);
    setSelectedOverlayPoint(null);
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
    setSelectedCountry({
      code: point.countryCode,
      name: point.countryName,
      coordinates: [point.longitude, point.latitude],
    });
    setSelectedRegion(null);
    setSelectedOverlayPoint(point);
    setSearchValue(point.countryName);
    setIsMobileWeatherOpen(true);
  }

  function handleClearWeatherSelection() {
    setSelectedCountry(null);
    setSelectedRegion(null);
    setSelectedOverlayPoint(null);
    setSearchValue("");
    setIsMobileWeatherOpen(false);
  }

  async function handleRefreshWeatherOverlay() {
    setWeatherOverlayLoadStatus("loading");

    try {
      const response = await fetch("/api/weather-overlay");
      const payload = (await response.json()) as WeatherOverlayApiResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to refresh weather overlay data.");
      }

      if (!payload.data || payload.data.length === 0) {
        setWeatherOverlayLoadStatus("empty");
        setWeatherOverlaySource(payload.source ?? "open-meteo");
        setWeatherOverlayUpdatedAt(payload.updatedAt ?? new Date().toISOString());
        return;
      }

      setWeatherOverlayPoints(payload.data);
      setSelectedOverlayPoint((currentPoint) =>
        currentPoint
          ? payload.data?.find((point) => point.id === currentPoint.id) ?? currentPoint
          : currentPoint,
      );
      setWeatherOverlaySource(payload.source ?? "open-meteo");
      setWeatherOverlayUpdatedAt(payload.updatedAt ?? new Date().toISOString());
      setWeatherOverlayLoadStatus("success");
    } catch {
      setWeatherOverlayPoints(WEATHER_OVERLAY_POINTS);
      setWeatherOverlaySource("mock");
      setWeatherOverlayUpdatedAt(new Date().toISOString());
      setWeatherOverlayLoadStatus("error");
    }
  }

  const formattedWeatherOverlayUpdatedAt = weatherOverlayUpdatedAt
    ? new Intl.DateTimeFormat("ko", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(weatherOverlayUpdatedAt))
    : null;

  const weatherOverlayStatusLabel =
    isWeatherOverlayVisible && weatherOverlayLoadStatus === "loading"
      ? "실시간 날씨 불러오는 중"
      : isWeatherOverlayVisible && weatherOverlayLoadStatus === "error"
        ? "실시간 연결 실패, mock 데이터 표시 중"
        : isWeatherOverlayVisible && weatherOverlayLoadStatus === "empty"
          ? "표시할 실시간 날씨 없음"
          : null;

  const visibleWeatherOverlayStatusLabel =
    isWeatherOverlayVisible && weatherOverlayLoadStatus === "loading"
      ? "Refreshing realtime weather..."
      : isWeatherOverlayVisible && weatherOverlayLoadStatus === "error"
        ? "Realtime unavailable. Showing mock overlay."
        : isWeatherOverlayVisible && weatherOverlayLoadStatus === "empty"
          ? "No realtime overlay points available."
          : isWeatherOverlayVisible && formattedWeatherOverlayUpdatedAt
            ? `${weatherOverlaySource} updated ${formattedWeatherOverlayUpdatedAt}`
            : weatherOverlayStatusLabel;

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
        isWeatherOverlayLoading={weatherOverlayLoadStatus === "loading"}
        weatherOverlayStatusLabel={visibleWeatherOverlayStatusLabel}
        variant="immersive"
        onSelectCountry={handleSelectCountry}
        onSelectRegion={handleSelectRegion}
        onSelectWeatherOverlayPoint={handleSelectWeatherOverlayPoint}
        onRefreshWeatherOverlay={handleRefreshWeatherOverlay}
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
