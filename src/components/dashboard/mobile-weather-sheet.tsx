import { WeatherMetricCard } from "@/components/weather/weather-metric-card";
import { WeatherReactiveButton } from "@/components/weather/weather-reactive-button";
import type { WeatherData } from "@/types/weather-data";

type MobileWeatherSheetProps = {
  weather: WeatherData | null;
  theme: "light" | "dark";
  isOpen: boolean;
  onToggleOpen: () => void;
};

function getWeatherSummary(weather: WeatherData | null) {
  if (!weather) {
    return {
      title: "지역 선택",
      subtitle: "지도나 검색에서 지역을 선택하세요",
      temperatureText: "--",
    };
  }

  return {
    title: weather.regionName ?? weather.countryName,
    subtitle: weather.regionName ? `${weather.countryName} / ${weather.regionCode}` : weather.countryCode,
    temperatureText: `${weather.temperature}\u00b0C`,
  };
}

export function MobileWeatherSheet({ weather, theme, isOpen, onToggleOpen }: MobileWeatherSheetProps) {
  const summary = getWeatherSummary(weather);
  const updatedAt = new Intl.DateTimeFormat("ko", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  const metricCards = weather
    ? [
        {
          label: "기온",
          value: `${weather.temperature}\u00b0C`,
          helperText: "현재 대기 온도",
        },
        {
          label: "체감",
          value: `${weather.feelsLike}\u00b0C`,
          helperText: "야외 체감 온도",
        },
        {
          label: "습도",
          value: `${weather.humidity}%`,
          helperText: "공기 중 수분 비율",
        },
        {
          label: "바람",
          value: `${weather.windSpeed} m/s`,
          helperText: "지표면 기준 풍속",
        },
      ]
    : [];

  return (
    <section
      aria-label="모바일 날씨 상세"
      className="absolute bottom-20 left-3 right-3 z-40 md:hidden"
    >
      <div className="overflow-hidden rounded-md border border-white/75 bg-white/95 shadow-2xl shadow-slate-950/22 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/92">
        <div className="flex items-center justify-center pt-2" aria-hidden="true">
          <span className="h-1 w-9 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        <div className="flex min-h-20 items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Weather Detail
            </p>
            <h2 className="mt-1 truncate text-base font-semibold text-slate-950 dark:text-slate-100">
              {summary.title}
            </h2>
            <p className="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
              {summary.subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className="font-mono text-2xl font-semibold leading-none tracking-normal text-slate-950 dark:text-white">
              {summary.temperatureText}
            </p>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls="mobile-weather-sheet-body"
              aria-label={isOpen ? "날씨 상세 접기" : "날씨 상세 펼치기"}
              onClick={onToggleOpen}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {isOpen ? "-" : "+"}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div id="mobile-weather-sheet-body" className="max-h-[52vh] overflow-y-auto border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            {weather ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Updated
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {updatedAt}
                    </p>
                  </div>
                  <WeatherReactiveButton condition={weather.condition} theme={theme}>
                    {weather.condition}
                  </WeatherReactiveButton>
                </div>
                <p className="mt-4 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {weather.description}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {metricCards.map((metricCard) => (
                    <WeatherMetricCard
                      key={metricCard.label}
                      condition={weather.condition}
                      label={metricCard.label}
                      value={metricCard.value}
                      helperText={metricCard.helperText}
                      theme={theme}
                    />
                  ))}
                </dl>
              </>
            ) : (
              <p className="break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                국가를 검색하거나 지도를 탭하면 이 시트에서 상세 날씨를 바로 확인할 수 있습니다.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
