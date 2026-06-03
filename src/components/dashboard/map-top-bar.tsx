import type { WeatherLayer } from "@/types/weather-layer";

type MapTopBarProps = {
  activeLayer: WeatherLayer;
  activeTimeLabel: string;
  isDark: boolean;
  selectedLabel: string;
  onToggleTheme: () => void;
};

export function MapTopBar({
  activeLayer,
  activeTimeLabel,
  isDark,
  selectedLabel,
  onToggleTheme,
}: MapTopBarProps) {
  const themeLabel = isDark ? "라이트" : "다크";

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
        <label className="pointer-events-auto flex h-11 w-full min-w-0 max-w-full flex-1 items-center gap-3 rounded-md border border-white/75 bg-white/95 px-3 text-sm text-slate-500 shadow-lg shadow-slate-950/12 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/88 dark:text-slate-400 md:max-w-[460px]">
          <span aria-hidden="true" className="font-mono text-base text-slate-400">
            /
          </span>
          <span className="truncate">{selectedLabel}</span>
          <span className="ml-auto rounded bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
            위치
          </span>
        </label>
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
