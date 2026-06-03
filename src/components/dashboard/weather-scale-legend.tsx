import type { WeatherLayer } from "@/types/weather-layer";

type WeatherScaleLegendProps = {
  activeLayer: WeatherLayer;
};

export function WeatherScaleLegend({ activeLayer }: WeatherScaleLegendProps) {
  return (
    <aside className="absolute bottom-32 right-3 z-20 hidden w-16 flex-col items-center gap-2 md:flex">
      <div className="overflow-hidden rounded-md border border-white/80 bg-white/92 text-center text-xs font-semibold text-slate-900 shadow-xl shadow-slate-950/18 backdrop-blur dark:border-slate-700 dark:bg-slate-950/88 dark:text-slate-100">
        <div className="border-b border-slate-200/70 px-3 py-2 font-mono text-[11px] dark:border-slate-700">
          {activeLayer.unit}
        </div>
        {activeLayer.legendValues.map((value, index) => (
          <div
            key={`${activeLayer.id}-${value}`}
            className="px-3 py-1 font-mono"
            style={{
              backgroundColor: activeLayer.legendPalette[index] ?? "#f8fafc",
              color: index < activeLayer.legendValues.length / 2 ? "#f8fafc" : "#0f172a",
            }}
          >
            {value}
          </div>
        ))}
      </div>
    </aside>
  );
}
