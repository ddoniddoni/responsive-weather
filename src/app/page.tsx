import { WeatherReactiveButton } from "@/components/weather/weather-reactive-button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <main className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Weather Reactive Button
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          PRD 컨셉에 맞춰 날씨 상태별 버튼 스타일을 먼저 구성했습니다.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <WeatherReactiveButton condition="sunny">
            Sunny Action
          </WeatherReactiveButton>
          <WeatherReactiveButton condition="rainy">
            Rainy Action
          </WeatherReactiveButton>
          <WeatherReactiveButton condition="cloudy">
            Cloudy Action
          </WeatherReactiveButton>
        </div>
      </main>
    </div>
  );
}
