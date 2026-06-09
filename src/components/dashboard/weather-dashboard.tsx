"use client";

import { useEffect, useMemo, useState } from "react";

import { ForecastTimeline } from "@/components/dashboard/forecast-timeline";
import { MapTopBar } from "@/components/dashboard/map-top-bar";
import { MobileWeatherSheet } from "@/components/dashboard/mobile-weather-sheet";
import { WeatherLayerRail } from "@/components/dashboard/weather-layer-rail";
import { WeatherScaleLegend } from "@/components/dashboard/weather-scale-legend";
import { MapLibreWeatherMap } from "@/components/map/maplibre-weather-map";
import { WeatherDetailPanel } from "@/components/weather/weather-detail-panel";
import { SEARCHABLE_LOCATIONS, type SearchableLocation } from "@/constants/searchable-locations";
import { FORECAST_TIMES, WEATHER_LAYERS } from "@/constants/weather-layers";
import { useWeatherOverlay } from "@/hooks/use-weather-overlay";
import { getMockWeatherByCountry, getMockWeatherByRegion } from "@/lib/weather/mock-weather";
import { getWeatherFromOverlayPoint } from "@/lib/weather/overlay-weather";
import type { SelectedCountry, SelectedRegion, WeatherOverlayPoint } from "@/types/weather-data";

function formatOverlayUpdatedAt(updatedAt: string | null) {
  if (!updatedAt) {
    return null;
  }

  const updatedDate = new Date(updatedAt);

  if (Number.isNaN(updatedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ko", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(updatedDate);
}

function formatWeatherOverlaySource(source: string) {
  if (source === "open-meteo") {
    return "Open-Meteo";
  }

  if (source === "mock") {
    return "예시 데이터";
  }

  return source;
}

function getCoordinateDistance(
  firstCoordinates: [number, number],
  secondCoordinates: [number, number],
) {
  const longitudeDelta = firstCoordinates[0] - secondCoordinates[0];
  const latitudeDelta = firstCoordinates[1] - secondCoordinates[1];

  return longitudeDelta * longitudeDelta + latitudeDelta * latitudeDelta;
}

function findClosestCountryOverlayPoint(
  country: SelectedCountry,
  points: WeatherOverlayPoint[],
) {
  const countryOverlayPoints = points.filter((point) => point.countryCode === country.code);

  if (countryOverlayPoints.length === 0) {
    return null;
  }

  if (!country.coordinates) {
    return countryOverlayPoints[0];
  }

  const countryCoordinates = country.coordinates;

  return countryOverlayPoints.reduce((closestPoint, currentPoint) => {
    const closestDistance = getCoordinateDistance(countryCoordinates, [
      closestPoint.longitude,
      closestPoint.latitude,
    ]);
    const currentDistance = getCoordinateDistance(countryCoordinates, [
      currentPoint.longitude,
      currentPoint.latitude,
    ]);

    return currentDistance < closestDistance ? currentPoint : closestPoint;
  }, countryOverlayPoints[0]);
}

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
  const weatherOverlay = useWeatherOverlay();
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const activeOverlayPoint = selectedOverlayPoint
    ? weatherOverlay.points.find((point) => point.id === selectedOverlayPoint.id) ?? selectedOverlayPoint
    : null;
  const weather = useMemo(() => {
    if (selectedRegion) {
      return getMockWeatherByRegion(selectedRegion);
    }

    if (activeOverlayPoint) {
      return getWeatherFromOverlayPoint(activeOverlayPoint);
    }

    if (!selectedCountry) {
      return null;
    }

    return getMockWeatherByCountry(selectedCountry.code, selectedCountry.name);
  }, [activeOverlayPoint, selectedCountry, selectedRegion]);

  const selectedLabel = weather?.regionName ?? weather?.countryName ?? "국가 또는 도시 검색";
  const formattedWeatherOverlayUpdatedAt = formatOverlayUpdatedAt(weatherOverlay.updatedAt);
  const visibleWeatherOverlayStatusLabel =
    isWeatherOverlayVisible && weatherOverlay.loadStatus === "loading"
      ? "실시간 날씨 갱신 중"
      : isWeatherOverlayVisible && weatherOverlay.loadStatus === "error"
        ? "실시간 연결 실패. 예시 데이터 표시 중"
        : isWeatherOverlayVisible && weatherOverlay.loadStatus === "empty"
          ? "표시할 실시간 지점 없음"
          : isWeatherOverlayVisible && formattedWeatherOverlayUpdatedAt
            ? `${formatWeatherOverlaySource(weatherOverlay.source)} ${formattedWeatherOverlayUpdatedAt} 갱신`
            : null;

  function handleSelectCountry(country: SelectedCountry) {
    const countryOverlayPoint =
      weatherOverlay.loadStatus === "success"
        ? findClosestCountryOverlayPoint(country, weatherOverlay.points)
        : null;

    setSelectedCountry(country);
    setSelectedRegion(null);
    setSelectedOverlayPoint(countryOverlayPoint);
    setSearchValue(country.name);
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

  return (
    <div
      className={`relative h-screen min-h-[680px] max-w-full overflow-hidden transition-colors ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-950"
      }`}
    >
      <MapLibreWeatherMap
        activeLayerId={activeLayer.id}
        selectedCountryCode={selectedCountry?.code ?? null}
        selectedCountryName={selectedCountry?.name ?? null}
        selectedCountryCoordinates={selectedCountry?.coordinates ?? null}
        weatherOverlayPoints={weatherOverlay.points}
        isWeatherOverlayVisible={isWeatherOverlayVisible}
        isWeatherOverlayLoading={weatherOverlay.loadStatus === "loading"}
        selectableLocations={SEARCHABLE_LOCATIONS}
        weatherOverlayStatusLabel={visibleWeatherOverlayStatusLabel}
        onSelectCountry={handleSelectCountry}
        onSelectWeatherOverlayPoint={handleSelectWeatherOverlayPoint}
        onRefreshWeatherOverlay={weatherOverlay.refresh}
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
        <div className="absolute bottom-24 right-4 top-24 z-20 hidden w-[330px] max-w-[calc(100vw-2rem)] min-w-0 md:block lg:w-[340px]">
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
