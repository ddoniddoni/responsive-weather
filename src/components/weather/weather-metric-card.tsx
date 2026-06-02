import { WeatherConditionEffects } from "@/components/weather/weather-condition-effects";
import type { WeatherCondition } from "@/types/weather";

type WeatherMetricCardProps = {
  condition: WeatherCondition;
  label: string;
  value: string;
  helperText: string;
  theme: "light" | "dark";
};

const WEATHER_METRIC_THEME_MAP: Record<
  WeatherCondition,
  {
    cardClassName: string;
    accentClassName: string;
  }
> = {
  sunny: {
    cardClassName:
      "border-amber-200 bg-amber-50 text-amber-950 shadow-[0_10px_24px_rgba(245,158,11,0.14)] dark:border-amber-400/30 dark:bg-amber-950/36 dark:text-amber-50",
    accentClassName: "bg-amber-400",
  },
  rainy: {
    cardClassName:
      "border-sky-200 bg-sky-50 text-sky-950 shadow-[0_10px_24px_rgba(14,165,233,0.14)] dark:border-sky-400/30 dark:bg-sky-950/42 dark:text-sky-50",
    accentClassName: "bg-sky-400",
  },
  cloudy: {
    cardClassName:
      "border-slate-200 bg-slate-50 text-slate-950 shadow-[0_10px_24px_rgba(100,116,139,0.13)] dark:border-slate-500/34 dark:bg-slate-700/52 dark:text-slate-50",
    accentClassName: "bg-slate-400",
  },
  snowy: {
    cardClassName:
      "border-cyan-100 bg-cyan-50 text-cyan-950 shadow-[0_10px_24px_rgba(34,211,238,0.12)] dark:border-cyan-300/28 dark:bg-cyan-950/36 dark:text-cyan-50",
    accentClassName: "bg-cyan-300",
  },
  stormy: {
    cardClassName:
      "border-violet-200 bg-violet-50 text-violet-950 shadow-[0_10px_24px_rgba(124,58,237,0.14)] dark:border-violet-300/28 dark:bg-violet-950/38 dark:text-violet-50",
    accentClassName: "bg-violet-400",
  },
  foggy: {
    cardClassName:
      "border-zinc-200 bg-zinc-50 text-zinc-950 shadow-[0_10px_24px_rgba(113,113,122,0.12)] dark:border-zinc-500/32 dark:bg-zinc-800/58 dark:text-zinc-50",
    accentClassName: "bg-zinc-400",
  },
  unknown: {
    cardClassName:
      "border-slate-200 bg-white text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50",
    accentClassName: "bg-slate-300",
  },
};

export function WeatherMetricCard({
  condition,
  label,
  value,
  helperText,
  theme,
}: WeatherMetricCardProps) {
  const weatherTheme = WEATHER_METRIC_THEME_MAP[condition];
  const baseTextClassName = theme === "dark" ? "text-slate-200" : "text-slate-600";

  return (
    <div
      className={`weather-button relative isolate min-h-32 overflow-hidden rounded-xl border p-4 ${weatherTheme.cardClassName}`}
    >
      <WeatherConditionEffects condition={condition} />
      <div className="relative z-10 flex h-full flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${weatherTheme.accentClassName}`}
            />
            <dt className={`text-xs font-semibold uppercase leading-none ${baseTextClassName}`}>{label}</dt>
          </div>
          <dd className="mt-2 pl-4 text-2xl font-bold leading-none tracking-normal">{value}</dd>
        </div>
        <p className={`pl-4 text-xs leading-5 ${baseTextClassName}`}>{helperText}</p>
      </div>
    </div>
  );
}
