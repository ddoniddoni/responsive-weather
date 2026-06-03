import type { WeatherData } from "@/types/weather-data";

type DashboardInsightsProps = {
  weather: WeatherData | null;
};

export function DashboardInsights({ weather }: DashboardInsightsProps) {
  const selectedLocationName = weather?.regionName ?? weather?.countryName ?? "None";
  const insightCards = [
    {
      label: "Coverage",
      value: "Global + ADM1",
      helperText: "Country selection with regional boundary drill-down where mock data is available.",
    },
    {
      label: "Selected",
      value: selectedLocationName,
      helperText: weather
        ? `${weather.temperature}°C, ${weather.condition}, humidity ${weather.humidity}%.`
        : "Select a country on the globe to populate the weather panel.",
    },
    {
      label: "Next",
      value: "Live API",
      helperText: "The current data layer is ready to be replaced with normalized provider responses.",
    },
  ];

  return (
    <section className="mx-auto mt-3 grid w-full max-w-7xl min-w-0 grid-cols-1 gap-3 lg:grid-cols-3">
      {insightCards.map((card) => (
        <article
          key={card.label}
          className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <h3 className="mt-2 truncate text-base font-semibold text-slate-950 dark:text-slate-100">{card.value}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.helperText}</p>
        </article>
      ))}
    </section>
  );
}
