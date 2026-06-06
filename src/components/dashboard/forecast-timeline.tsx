type ForecastTimelineProps = {
  activeTime: number;
  times: string[];
  onSelectTime: (timeIndex: number) => void;
};

export function ForecastTimeline({ activeTime, times, onSelectTime }: ForecastTimelineProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 max-w-[100vw] overflow-hidden border-t border-white/20 bg-slate-950/76 px-3 py-3 text-white shadow-[0_-16px_40px_rgba(15,23,42,0.28)] backdrop-blur md:px-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center">
        <button
          type="button"
          aria-label="Previous forecast time"
          onClick={() => onSelectTime(Math.max(0, activeTime - 1))}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 font-mono text-sm font-semibold transition-colors hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 md:inline-flex"
        >
          &lt;
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
          {times.map((time, index) => (
            <button
              key={time}
              type="button"
              aria-pressed={activeTime === index}
              onClick={() => onSelectTime(index)}
              className={`h-10 min-w-16 rounded-md px-3 font-mono text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                activeTime === index ? "bg-white text-sky-700" : "bg-white/10 text-white hover:bg-white/18"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Next forecast time"
          onClick={() => onSelectTime(Math.min(times.length - 1, activeTime + 1))}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 font-mono text-sm font-semibold transition-colors hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 md:inline-flex"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
