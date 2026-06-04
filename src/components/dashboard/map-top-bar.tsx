"use client";

import { useMemo, useState } from "react";

import type { SearchableLocation } from "@/constants/searchable-locations";
import type { WeatherLayer } from "@/types/weather-layer";

type MapTopBarProps = {
  activeLayer: WeatherLayer;
  activeTimeLabel: string;
  isDark: boolean;
  searchLocations: SearchableLocation[];
  searchValue: string;
  selectedLabel: string;
  onSearchValueChange: (value: string) => void;
  onSelectSearchLocation: (location: SearchableLocation) => void;
  onToggleTheme: () => void;
};

export function MapTopBar({
  activeLayer,
  activeTimeLabel,
  isDark,
  searchLocations,
  searchValue,
  selectedLabel,
  onSearchValueChange,
  onSelectSearchLocation,
  onToggleTheme,
}: MapTopBarProps) {
  const themeLabel = isDark ? "라이트" : "다크";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const filteredLocations = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return searchLocations;
    }

    return searchLocations.filter((location) => {
      const searchableText = [location.name, location.code, ...location.aliases].join(" ").toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [searchLocations, searchValue]);

  function handleSelectLocation(location: SearchableLocation) {
    onSelectSearchLocation(location);
    setIsSearchOpen(false);
  }

  return (
    <header className="pointer-events-none absolute inset-x-3 top-3 z-30 flex w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] flex-col gap-2 overflow-hidden md:inset-x-4 md:w-auto md:max-w-none md:flex-row md:items-center md:justify-between md:overflow-visible">
      <div className="flex min-w-0 max-w-full flex-col gap-2 md:flex-1 md:flex-row md:items-center">
        <div className="pointer-events-auto flex items-center justify-between gap-2 md:block">
          <div className="flex h-11 shrink-0 items-center gap-2 rounded-md border border-white/75 bg-white/95 px-3 text-slate-950 shadow-lg shadow-slate-950/12 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-100">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-950 text-[11px] font-black text-white dark:bg-white dark:text-slate-950">
              RW
            </div>
            <span className="hidden text-base font-bold tracking-normal min-[420px]:block">Responsive Weather</span>
          </div>
          <button
            type="button"
            aria-label={`${themeLabel} 모드로 전환`}
            onClick={onToggleTheme}
            className="h-11 rounded-md border border-white/75 bg-white/95 px-4 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/12 backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-100 dark:hover:bg-slate-900 md:hidden"
          >
            {themeLabel}
          </button>
        </div>
        <div className="pointer-events-auto relative w-full min-w-0 max-w-full flex-1 md:max-w-[460px]">
          <label className="flex h-11 w-full min-w-0 items-center gap-3 rounded-md border border-white/75 bg-white/95 px-3 text-sm text-slate-500 shadow-lg shadow-slate-950/12 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-400">
            <span aria-hidden="true" className="font-mono text-base text-slate-400">
              /
            </span>
            <span className="sr-only">국가 검색</span>
            <input
              type="search"
              value={searchValue}
              placeholder={selectedLabel}
              aria-label="국가 검색"
              onChange={(event) => {
                onSearchValueChange(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setIsSearchOpen(false), 120);
              }}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
            <span className="ml-auto rounded bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
              위치
            </span>
          </label>
          {isSearchOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.375rem)] max-h-64 overflow-y-auto rounded-md border border-white/75 bg-white/96 p-1.5 text-sm shadow-xl shadow-slate-950/18 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/94">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <button
                    key={location.code}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectLocation(location)}
                    className="flex h-11 w-full items-center justify-between gap-3 rounded px-3 text-left text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="min-w-0 truncate font-semibold">{location.name}</span>
                    <span className="shrink-0 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {location.code}
                    </span>
                  </button>
                ))
              ) : (
                <div role="status" className="px-3 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                  지원하는 mock 지역이 없습니다
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="pointer-events-auto hidden items-center gap-2 self-start md:flex md:self-auto">
        <div className="hidden rounded-md border border-white/75 bg-white/95 px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-lg shadow-slate-950/12 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-200 sm:block">
          {activeLayer.label} / {activeTimeLabel}
        </div>
        <button
          type="button"
          aria-label={`${themeLabel} 모드로 전환`}
          onClick={onToggleTheme}
          className="h-11 rounded-md border border-white/75 bg-white/95 px-4 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/12 backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          {themeLabel}
        </button>
      </div>
    </header>
  );
}
