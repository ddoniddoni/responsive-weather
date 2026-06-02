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
      ? "border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
      : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50";

  return (
    <button
      type={type}
      className={`weather-button relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl border px-4 text-sm font-semibold shadow-[0_4px_14px_rgba(15,23,42,0.1)] transition-colors ${themeClassName} ${className ?? ""}`}
      {...props}
    >
      <WeatherConditionEffects condition={condition} />
      {children}
    </button>
  );
}
