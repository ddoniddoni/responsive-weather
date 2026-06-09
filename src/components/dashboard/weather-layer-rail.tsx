import type { WeatherLayer } from "@/types/weather-layer";

type WeatherLayerRailProps = {
  activeLayer: WeatherLayer;
  layers: WeatherLayer[];
  onSelectLayer: (layer: WeatherLayer) => void;
};

export function WeatherLayerRail({ activeLayer, layers, onSelectLayer }: WeatherLayerRailProps) {
  return (
    <aside
      aria-label="날씨 레이어"
      className="absolute left-3 right-3 top-32 z-20 flex max-w-[calc(100vw-1.5rem)] gap-1.5 overflow-x-auto rounded-md border border-white/70 bg-slate-950/74 p-1.5 shadow-xl shadow-slate-950/18 backdrop-blur md:left-4 md:right-auto md:top-24 md:max-h-[calc(100vh-14rem)] md:w-36 md:max-w-none md:flex-col md:overflow-y-auto"
    >
      {layers.map((layer) => {
        const isActive = activeLayer.id === layer.id;

        return (
          <button
            key={layer.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectLayer(layer)}
            className={`flex h-9 min-w-24 items-center justify-between rounded px-3 text-left text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 md:min-w-0 ${
              isActive ? "bg-white text-slate-950 shadow-sm" : "text-white/88 hover:bg-white/12"
            }`}
          >
            <span className="truncate md:hidden">{layer.shortLabel}</span>
            <span className="hidden truncate md:inline">{layer.label}</span>
            <span className={`font-mono text-[11px] ${isActive ? "text-sky-700" : "text-white/58"}`}>
              {layer.unit}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
