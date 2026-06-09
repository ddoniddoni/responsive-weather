import { WeatherInsightStrip } from "@/components/weather/weather-insight-strip";
import { WeatherMetricCard } from "@/components/weather/weather-metric-card";
import { WeatherReactiveButton } from "@/components/weather/weather-reactive-button";
import { getWeatherInsights } from "@/lib/weather/weather-insights";
import type { WeatherCondition } from "@/types/weather";
import type { WeatherData } from "@/types/weather-data";

type WeatherDetailPanelProps = {
  weather: WeatherData | null;
  theme: "light" | "dark";
  variant?: "panel" | "overlay";
  onClose?: () => void;
};

function formatUpdatedAt(updatedAt: string | undefined) {
  const updatedDate = updatedAt ? new Date(updatedAt) : new Date();

  return new Intl.DateTimeFormat("ko", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(Number.isNaN(updatedDate.getTime()) ? new Date() : updatedDate);
}

const WEATHER_CONDITION_LABEL_MAP: Record<WeatherCondition, string> = {
  sunny: "맑음",
  rainy: "비",
  cloudy: "흐림",
  snowy: "눈",
  stormy: "폭풍",
  foggy: "안개",
  unknown: "확인 중",
};

const SOURCE_LABEL_MAP: Record<string, string> = {
  "Weather data": "날씨 데이터",
  "Mock country preview": "국가 예시 데이터",
  "Mock regional preview": "지역 예시 데이터",
  "Mock overlay": "오버레이 예시",
  "Open-Meteo current": "Open-Meteo 현재",
};

function getConditionLabel(condition: WeatherCondition) {
  return WEATHER_CONDITION_LABEL_MAP[condition];
}

function getSourceLabel(sourceLabel: string) {
  return SOURCE_LABEL_MAP[sourceLabel] ?? sourceLabel;
}

export function WeatherDetailPanel({ weather, theme, variant = "panel", onClose }: WeatherDetailPanelProps) {
  const isOverlay = variant === "overlay";
  const panelClassName = isOverlay
    ? "max-h-full overflow-y-auto rounded-md border border-white/70 bg-white/94 p-3 shadow-2xl shadow-slate-950/20 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/90"
    : "rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950";

  if (!weather) {
    return (
      <aside className={panelClassName}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          날씨 상세
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">위치를 선택하세요</h2>
        <p className="mt-3 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
          국가, 지역, 실시간 마커를 선택하면 기온, 바람, 습도, 날씨 상태를 확인할 수 있습니다.
        </p>
      </aside>
    );
  }

  const title = weather.regionName ?? weather.countryName;
  const subtitle = weather.regionName ? `${weather.countryName} / ${weather.regionCode}` : weather.countryCode;
  const sourceLabel = getSourceLabel(weather.sourceLabel ?? "Weather data");
  const updatedAt = formatUpdatedAt(weather.updatedAt);
  const temperatureText = `${weather.temperature}\u00b0C`;
  const insights = getWeatherInsights(weather);
  const metricCards = [
    {
      label: "기온",
      value: temperatureText,
      helperText: "현재 기온",
    },
    {
      label: "체감",
      value: `${weather.feelsLike}\u00b0C`,
      helperText: "체감 온도",
    },
    {
      label: "습도",
      value: `${weather.humidity}%`,
      helperText: "공기 중 습도",
    },
    {
      label: "바람",
      value: `${weather.windSpeed} m/s`,
      helperText: "지표면 풍속",
    },
  ];

  return (
    <aside className={panelClassName}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.08em] text-slate-500 dark:text-slate-400">
            날씨 상세
          </p>
          <h2 className="mt-1 truncate text-lg font-bold text-slate-950 dark:text-slate-100">{title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{subtitle}</p>
            <span className="inline-flex min-h-5 items-center rounded border border-slate-200 bg-slate-50 px-1.5 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {sourceLabel}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <WeatherReactiveButton condition={weather.condition} theme={theme} className="h-8 min-w-16 px-2">
            {getConditionLabel(weather.condition)}
          </WeatherReactiveButton>
          {onClose ? (
            <button
              type="button"
              aria-label="날씨 상세 닫기"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white/86 text-base font-bold leading-none text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:border-slate-700 dark:bg-slate-900/82 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              x
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-3 border-y border-slate-200 py-3 dark:border-slate-800">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.08em] text-slate-500 dark:text-slate-400">
              현재
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold leading-none tracking-normal text-slate-950 dark:text-white">
              {temperatureText}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">업데이트</p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{updatedAt}</p>
          </div>
        </div>
        <p className="mt-3 break-words text-sm leading-5 text-slate-600 dark:text-slate-300">
          {weather.description}
        </p>
      </div>
      <div className="mt-3">
        <WeatherInsightStrip insights={insights} />
      </div>
      <dl
        className={`mt-3 grid grid-cols-1 gap-2 text-sm ${
          isOverlay ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
        }`}
      >
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
    </aside>
  );
}
