import { NextResponse } from "next/server";

import { getOpenMeteoWeatherOverlayPoints } from "@/lib/weather/open-meteo-weather";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await getOpenMeteoWeatherOverlayPoints();

    return NextResponse.json({
      data,
      source: "open-meteo",
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        data: [],
        source: "open-meteo",
        error: "날씨 오버레이 데이터를 불러오지 못했습니다.",
        updatedAt: new Date().toISOString(),
      },
      {
        status: 502,
      },
    );
  }
}
