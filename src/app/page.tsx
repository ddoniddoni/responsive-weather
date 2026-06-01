"use client";

import { useEffect, useState } from "react";

import { WeatherReactiveButton } from "@/components/weather/weather-reactive-button";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-6 transition-colors ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <main
        className={`w-full max-w-2xl rounded-2xl border p-8 transition-colors ${
          isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Weather Reactive Button
          </h1>
          <button
            type="button"
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-semibold transition-colors ${
              isDark
                ? "border-slate-600 text-slate-100 hover:bg-slate-700"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {isDark ? "☀" : "🌙"}
            </span>
            <span className="sr-only">{isDark ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
        <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          라이트/다크 모드 전환에 맞춰 버튼과 배경 스타일이 함께 변경됩니다.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <WeatherReactiveButton condition="sunny" theme={theme}>
            Sunny Action
          </WeatherReactiveButton>
          <WeatherReactiveButton condition="rainy" theme={theme}>
            Rainy Action
          </WeatherReactiveButton>
          <WeatherReactiveButton condition="cloudy" theme={theme}>
            Cloudy Action
          </WeatherReactiveButton>
        </div>
      </main>
    </div>
  );
}
