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
    accentClassName: string;
    surfaceClassName: string;
  }
> = {
  sunny: {
    accentClassName: "bg-amber-600",
    surfaceClassName: "border-amber-200/70 bg-amber-50/55 dark:border-amber-500/20 dark:bg-amber-950/12",
  },
  rainy: {
    accentClassName: "bg-cyan-700",
    surfaceClassName: "border-cyan-200/70 bg-cyan-50/55 dark:border-cyan-400/20 dark:bg-cyan-950/16",
  },
  cloudy: {
    accentClassName: "bg-slate-500",
    surfaceClassName: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900",
  },
  snowy: {
    accentClassName: "bg-sky-500",
    surfaceClassName: "border-sky-200/70 bg-sky-50/50 dark:border-sky-300/20 dark:bg-sky-950/14",
  },
  stormy: {
    accentClassName: "bg-indigo-600",
    surfaceClassName: "border-indigo-200/70 bg-indigo-50/50 dark:border-indigo-400/20 dark:bg-indigo-950/16",
  },
  foggy: {
    accentClassName: "bg-zinc-500",
    surfaceClassName: "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900",
  },
  unknown: {
    accentClassName: "bg-slate-400",
    surfaceClassName: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
  },
};

export function WeatherMetricCard({ condition, label, value, helperText, theme }: WeatherMetricCardProps) {
  const weatherTheme = WEATHER_METRIC_THEME_MAP[condition];
  const mutedTextClassName = theme === "dark" ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-20 rounded-md border p-3 ${weatherTheme.surfaceClassName}`}>
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${weatherTheme.accentClassName}`} />
        <dt className={`text-[11px] font-bold tracking-[0.06em] ${mutedTextClassName}`}>{label}</dt>
      </div>
      <dd className="mt-2 font-mono text-xl font-semibold leading-none tracking-normal text-slate-950 dark:text-slate-100">
        {value}
      </dd>
      <p className={`mt-2 line-clamp-2 text-[11px] leading-4 ${mutedTextClassName}`}>{helperText}</p>
    </div>
  );
}
