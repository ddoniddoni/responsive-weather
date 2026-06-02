import type { WeatherData } from "@/types/weather-data";

type DashboardInsightsProps = {
  weather: WeatherData | null;
};

export function DashboardInsights({ weather }: DashboardInsightsProps) {
  const selectedLocationName = weather?.regionName ?? weather?.countryName;

  return (
    <section className="mx-auto mt-4 grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Global Snapshot</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          지도에서 국가를 선택하면 현재 날씨 상태를 확인하고, 이후 시간대별/주간 예보로 확장할 수 있습니다.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Selected Location</h3>
        {weather ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {selectedLocationName}: {weather.temperature}°C, {weather.condition}, humidity {weather.humidity}%.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            아직 선택된 국가가 없습니다. 지구본에서 국가를 클릭해 주세요.
          </p>
        )}
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Next Improvements</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          실시간 API 연동, 국가 검색, 즐겨찾기, 시간대별 강수 애니메이션을 다음 단계로 추가할 수 있습니다.
        </p>
      </article>
    </section>
  );
}
