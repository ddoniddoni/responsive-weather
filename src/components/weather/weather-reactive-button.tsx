import type { ButtonHTMLAttributes, ReactNode } from "react";

import type { WeatherCondition } from "@/types/weather";

type WeatherReactiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  condition: WeatherCondition;
  children: ReactNode;
};

const CONDITION_CLASS_MAP: Record<WeatherCondition, string> = {
  sunny:
    "bg-amber-200 text-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.42)] hover:bg-amber-100 dark:bg-amber-300 dark:text-amber-950",
  rainy:
    "bg-slate-200 text-slate-900 shadow-[0_0_16px_rgba(71,85,105,0.28)] hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600",
  cloudy:
    "bg-sky-100 text-slate-800 shadow-[0_8px_24px_rgba(100,116,139,0.2)] hover:bg-sky-50 dark:bg-sky-900/50 dark:text-sky-50",
  snowy:
    "bg-cyan-50 text-cyan-900 shadow-[0_6px_20px_rgba(186,230,253,0.45)] hover:bg-white dark:bg-cyan-900/45 dark:text-cyan-50",
  stormy:
    "bg-violet-200 text-violet-950 shadow-[0_0_18px_rgba(139,92,246,0.4)] hover:bg-violet-100 dark:bg-violet-900 dark:text-violet-50 dark:hover:bg-violet-800",
  foggy:
    "bg-zinc-300 text-zinc-900 shadow-[0_6px_16px_rgba(113,113,122,0.35)] hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100",
  unknown:
    "bg-zinc-200 text-zinc-900 shadow-[0_6px_16px_rgba(39,39,42,0.2)] hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
};

export function WeatherReactiveButton({
  condition,
  className,
  children,
  type = "button",
  ...props
}: WeatherReactiveButtonProps) {
  const isSunny = condition === "sunny";
  const isRainy = condition === "rainy";

  return (
    <button
      type={type}
      className={`weather-button relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl px-4 text-sm font-semibold transition-colors ${CONDITION_CLASS_MAP[condition]} ${className ?? ""}`}
      {...props}
    >
      {isSunny ? (
        <span
          aria-hidden="true"
          className="weather-sun absolute -right-1 -top-1 h-4 w-4"
        />
      ) : null}
      {isRainy ? (
        <span aria-hidden="true" className="weather-rain absolute inset-0" />
      ) : null}
      {children}
    </button>
  );
}
