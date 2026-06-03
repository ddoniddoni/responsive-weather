import type { ButtonHTMLAttributes, ReactNode } from "react";

import { WeatherConditionEffects } from "@/components/weather/weather-condition-effects";
import type { WeatherCondition } from "@/types/weather";

type WeatherButtonTheme = "light" | "dark";

type WeatherReactiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  condition: WeatherCondition;
  children: ReactNode;
  theme?: WeatherButtonTheme;
};

export function WeatherReactiveButton({
  condition,
  className,
  children,
  theme = "light",
  type = "button",
  ...props
}: WeatherReactiveButtonProps) {
  const themeClassName =
    theme === "dark"
      ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
      : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50";

  return (
    <button
      type={type}
      className={`weather-button weather-condition-pill relative inline-flex h-9 min-w-24 items-center justify-center overflow-hidden rounded-md border px-3 text-xs font-semibold capitalize shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 ${themeClassName} ${className ?? ""}`}
      {...props}
    >
      <WeatherConditionEffects condition={condition} />
      <span className="relative z-10 truncate">{children}</span>
    </button>
  );
}
