import type { WeatherInsight } from "@/lib/weather/weather-insights";

type WeatherInsightStripProps = {
  insights: WeatherInsight[];
};

export function WeatherInsightStrip({ insights }: WeatherInsightStripProps) {
  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {insights.map((insight) => (
        <div
          key={insight.label}
          className="rounded-md border border-slate-200 bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900/72"
        >
          <dt className="text-[10px] font-bold tracking-[0.06em] text-slate-500 dark:text-slate-400">
            {insight.label}
          </dt>
          <dd className="mt-1 truncate text-sm font-bold tracking-normal text-slate-950 dark:text-slate-100">
            {insight.value}
          </dd>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{insight.helperText}</p>
        </div>
      ))}
    </dl>
  );
}
