"use client";

import { useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { SearchableLocation } from "@/constants/searchable-locations";

const NO_HIGHLIGHTED_RESULT = -1;

type MapTopBarProps = {
  isDark: boolean;
  searchLocations: SearchableLocation[];
  searchValue: string;
  selectedLabel: string;
  onSearchValueChange: (value: string) => void;
  onSelectSearchLocation: (location: SearchableLocation) => void;
  onToggleTheme: () => void;
};

function ThemeToggleIcon({ isDark }: { isDark: boolean }) {
  if (isDark) {
    return (
      <svg className="theme-toggle-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20.2 15.4A7.7 7.7 0 0 1 8.6 3.8 8.8 8.8 0 1 0 20.2 15.4Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg className="theme-toggle-svg" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path
        d="M12 2.5V5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function MapTopBar({
  isDark,
  searchLocations,
  searchValue,
  selectedLabel,
  onSearchValueChange,
  onSelectSearchLocation,
  onToggleTheme,
}: MapTopBarProps) {
  const themeLabel = isDark ? "light" : "dark";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedResultIndex, setHighlightedResultIndex] = useState(0);
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
  const safeHighlightedResultIndex =
    filteredLocations.length > 0
      ? Math.min(highlightedResultIndex, filteredLocations.length - 1)
      : NO_HIGHLIGHTED_RESULT;
  const selectedLocation = searchLocations.find((location) => location.name === selectedLabel);
  const searchStatusLabel =
    filteredLocations.length > 0
      ? `${filteredLocations.length} locations`
      : "No matching locations";

  function handleSelectLocation(location: SearchableLocation) {
    onSelectSearchLocation(location);
    setIsSearchOpen(false);
    setHighlightedResultIndex(0);
  }

  function handleSearchChange(value: string) {
    onSearchValueChange(value);
    setIsSearchOpen(true);
    setHighlightedResultIndex(0);
  }

  function handleClearSearch() {
    onSearchValueChange("");
    setIsSearchOpen(true);
    setHighlightedResultIndex(0);
  }

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsSearchOpen(true);
      setHighlightedResultIndex((currentIndex) => {
        if (filteredLocations.length === 0) {
          return NO_HIGHLIGHTED_RESULT;
        }

        return Math.min(currentIndex + 1, filteredLocations.length - 1);
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsSearchOpen(true);
      setHighlightedResultIndex((currentIndex) => Math.max(currentIndex - 1, 0));
      return;
    }

    if (event.key === "Enter" && isSearchOpen && safeHighlightedResultIndex >= 0) {
      event.preventDefault();
      handleSelectLocation(filteredLocations[safeHighlightedResultIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsSearchOpen(false);
    }
  }

  return (
    <header className="pointer-events-none absolute inset-x-3 top-3 z-30 flex w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] flex-col gap-2 overflow-hidden md:inset-x-4 md:w-auto md:max-w-none md:flex-row md:items-center md:justify-between md:overflow-visible">
      <div className="flex min-w-0 max-w-full flex-col gap-2 md:flex-1 md:flex-row md:items-center">
        <div className="pointer-events-auto flex items-center justify-between gap-2">
          <div className="flex h-11 shrink-0 items-center gap-2 rounded-md border border-white/75 bg-white/95 px-3 text-slate-950 shadow-lg shadow-slate-950/12 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-100">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded bg-slate-950 text-[11px] font-black leading-none text-white dark:bg-white dark:text-slate-950">
              RW
            </div>
            <span className="hidden translate-y-px text-base font-bold leading-none tracking-normal min-[420px]:block">
              Responsive Weather
            </span>
          </div>
          <button
            type="button"
            aria-label={`Switch to ${themeLabel} mode`}
            onClick={onToggleTheme}
            className="theme-toggle-button md:hidden"
          >
            <ThemeToggleIcon isDark={isDark} />
            <span className="sr-only">Switch to {themeLabel} mode</span>
          </button>
        </div>
        <div className="pointer-events-auto relative w-full min-w-0 max-w-full flex-1 md:max-w-[460px]">
          <label className="flex h-11 w-full min-w-0 items-center gap-3 rounded-md border border-white/75 bg-white/95 px-3 text-sm text-slate-500 shadow-lg shadow-slate-950/12 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-400">
            <span aria-hidden="true" className="font-mono text-base text-slate-400">
              /
            </span>
            <span className="sr-only">Search locations</span>
            <input
              type="search"
              value={searchValue}
              placeholder={selectedLabel}
              aria-label="Search locations"
              onChange={(event) => {
                handleSearchChange(event.target.value);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setIsSearchOpen(false), 120);
              }}
              onKeyDown={handleSearchKeyDown}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
            {searchValue ? (
              <button
                type="button"
                aria-label="Clear search"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClearSearch}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                x
              </button>
            ) : null}
            <span className="ml-auto rounded bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
              Locate
            </span>
          </label>
          {isSearchOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.375rem)] max-h-64 overflow-y-auto rounded-md border border-white/75 bg-white/96 p-1.5 text-sm shadow-xl shadow-slate-950/18 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/94">
              <div className="flex items-center justify-between gap-3 px-2.5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="min-w-0 truncate">
                  {selectedLocation ? `Selected: ${selectedLocation.name}` : "Choose a location"}
                </span>
                <span className="shrink-0 rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {searchStatusLabel}
                </span>
              </div>
              {filteredLocations.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {filteredLocations.map((location, index) => {
                    const isHighlighted = safeHighlightedResultIndex === index;

                    return (
                      <button
                        key={location.code}
                        type="button"
                        aria-current={selectedLocation?.code === location.code ? "true" : undefined}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setHighlightedResultIndex(index)}
                        onClick={() => handleSelectLocation(location)}
                        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                          isHighlighted
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                            : "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{location.name}</span>
                          <span
                            className={`block truncate text-xs ${
                              isHighlighted ? "text-white/72 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {location.aliases.slice(0, 3).join(" / ")}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded px-2 py-1 font-mono text-xs font-bold ${
                            isHighlighted
                              ? "bg-white/16 text-white dark:bg-slate-950/10 dark:text-slate-700"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {location.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div role="status" className="px-3 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                  This MVP currently supports South Korea, United States, Japan, and France.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="pointer-events-auto hidden items-center gap-2 self-start md:flex md:self-auto">
        <button
          type="button"
          aria-label={`Switch to ${themeLabel} mode`}
          onClick={onToggleTheme}
          className="theme-toggle-button"
        >
          <ThemeToggleIcon isDark={isDark} />
          <span className="sr-only">Switch to {themeLabel} mode</span>
        </button>
      </div>
    </header>
  );
}
