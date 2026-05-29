import type { ButtonHTMLAttributes, ReactNode } from "react";

import type { WeatherCondition } from "@/types/weather";

type WeatherReactiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  condition: WeatherCondition;
  children: ReactNode;
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
  const isCloudy = condition === "cloudy";

  return (
    <button
      type={type}
      className={`weather-button relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.1)] transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 ${className ?? ""}`}
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
        <span aria-hidden="true" className="weather-cloud absolute inset-0" />
      ) : null}
      {children}
    </button>
  );
}
