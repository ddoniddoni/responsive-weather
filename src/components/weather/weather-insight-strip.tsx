import type { WeatherInsight } from "@/lib/weather/weather-insights";

type WeatherInsightStripProps = {
  insights: WeatherInsight[];
  density?: "default" | "compact";
};

export function WeatherInsightStrip({ insights, density = "default" }: WeatherInsightStripProps) {
  const isCompact = density === "compact";

  return (
    <dl className={`grid grid-cols-1 sm:grid-cols-3 ${isCompact ? "gap-1.5" : "gap-2"}`}>
      {insights.map((insight) => (
        <div
          key={insight.label}
          className={`rounded-md border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/72 ${
            isCompact ? "px-2 py-1.5" : "px-2.5 py-2"
          }`}
        >
          <dt className="text-[10px] font-bold tracking-[0.06em] text-slate-500 dark:text-slate-400">
            {insight.label}
          </dt>
          <dd
            className={`${isCompact ? "mt-0.5 text-[13px]" : "mt-1 text-sm"} truncate font-bold tracking-normal text-slate-950 dark:text-slate-100`}
          >
            {insight.value}
          </dd>
          <p className={`${isCompact ? "mt-0.5 text-[11px]" : "mt-1 text-xs"} truncate text-slate-500 dark:text-slate-400`}>
            {insight.helperText}
          </p>
        </div>
      ))}
    </dl>
  );
}
