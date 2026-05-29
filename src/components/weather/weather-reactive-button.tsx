import type { ButtonHTMLAttributes, ReactNode } from "react";

import type { WeatherCondition } from "@/types/weather";

type WeatherReactiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  condition: WeatherCondition;
  children: ReactNode;
};

const CONDITION_CLASS_MAP: Record<WeatherCondition, string> = {
  sunny:
    "bg-amber-300 text-amber-950 shadow-[0_0_24px_rgba(251,191,36,0.55)] hover:bg-amber-200",
  rainy:
    "bg-slate-700 text-slate-50 shadow-[0_0_18px_rgba(30,41,59,0.5)] hover:bg-slate-600",
  cloudy:
    "bg-sky-100 text-slate-800 shadow-[0_8px_24px_rgba(100,116,139,0.25)] hover:bg-sky-50",
  snowy:
    "bg-cyan-50 text-cyan-900 shadow-[0_6px_20px_rgba(186,230,253,0.45)] hover:bg-white",
  stormy:
    "bg-violet-900 text-violet-50 shadow-[0_0_18px_rgba(91,33,182,0.5)] hover:bg-violet-800",
  foggy:
    "bg-zinc-300 text-zinc-900 shadow-[0_6px_16px_rgba(113,113,122,0.35)] hover:bg-zinc-200",
  unknown:
    "bg-zinc-800 text-zinc-100 shadow-[0_6px_16px_rgba(39,39,42,0.4)] hover:bg-zinc-700",
};

export function WeatherReactiveButton({
  condition,
  className,
  children,
  type = "button",
  ...props
}: WeatherReactiveButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors ${CONDITION_CLASS_MAP[condition]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
