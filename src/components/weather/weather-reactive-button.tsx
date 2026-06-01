import type { ButtonHTMLAttributes, ReactNode } from "react";

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
  const isSunny = condition === "sunny";
  const isRainy = condition === "rainy";
  const isCloudy = condition === "cloudy";
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
      {isSunny ? (
        <span
          aria-hidden="true"
          className="weather-sun absolute -right-1 -top-1 h-4 w-4"
        />
      ) : null}
      {isRainy ? (
        <span aria-hidden="true" className="weather-rain absolute inset-0">
          <span className="weather-rain-drop weather-rain-drop-1" />
          <span className="weather-rain-drop weather-rain-drop-2" />
          <span className="weather-rain-drop weather-rain-drop-3" />
          <span className="weather-rain-drop weather-rain-drop-4" />
        </span>
      ) : null}
      {isCloudy ? (
        <span aria-hidden="true" className="weather-cloud absolute inset-0">
          <span className="weather-cloud-shape" />
          <span className="weather-cloud-shape weather-cloud-shape-2" />
        </span>
      ) : null}
      {children}
    </button>
  );
}
