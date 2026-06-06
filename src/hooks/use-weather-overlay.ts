"use client";

import { useCallback, useEffect, useState } from "react";

import { WEATHER_OVERLAY_POINTS } from "@/constants/weather-overlay-points";
import type { WeatherOverlayPoint } from "@/types/weather-data";

export type WeatherOverlayLoadStatus = "loading" | "success" | "error" | "empty";

type WeatherOverlayApiResponse = {
  data?: WeatherOverlayPoint[];
  error?: string;
  source?: string;
  updatedAt?: string;
};

type WeatherOverlayState = {
  points: WeatherOverlayPoint[];
  loadStatus: WeatherOverlayLoadStatus;
  source: string;
  updatedAt: string | null;
  refresh: () => void;
};

export function useWeatherOverlay(): WeatherOverlayState {
  const [points, setPoints] = useState<WeatherOverlayPoint[]>(WEATHER_OVERLAY_POINTS);
  const [loadStatus, setLoadStatus] = useState<WeatherOverlayLoadStatus>("loading");
  const [source, setSource] = useState("mock");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const loadWeatherOverlayPoints = useCallback(async (signal?: AbortSignal) => {
    setLoadStatus("loading");

    try {
      const response = await fetch("/api/weather-overlay", {
        signal,
      });
      const payload = (await response.json()) as WeatherOverlayApiResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load weather overlay data.");
      }

      setSource(payload.source ?? "open-meteo");
      setUpdatedAt(payload.updatedAt ?? new Date().toISOString());

      if (!payload.data || payload.data.length === 0) {
        setLoadStatus("empty");
        return;
      }

      setPoints(payload.data);
      setLoadStatus("success");
    } catch {
      if (signal?.aborted) {
        return;
      }

      setPoints(WEATHER_OVERLAY_POINTS);
      setSource("mock");
      setUpdatedAt(new Date().toISOString());
      setLoadStatus("error");
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    queueMicrotask(() => {
      void loadWeatherOverlayPoints(abortController.signal);
    });

    return () => abortController.abort();
  }, [loadWeatherOverlayPoints]);

  const refresh = useCallback(() => {
    void loadWeatherOverlayPoints();
  }, [loadWeatherOverlayPoints]);

  return {
    points,
    loadStatus,
    source,
    updatedAt,
    refresh,
  };
}
