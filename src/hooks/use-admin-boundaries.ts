import { useEffect, useState } from "react";

import { fetchAdminBoundaries } from "@/lib/map/admin-boundaries";
import type {
  AdminBoundaryFeatureCollection,
  AdminBoundaryLevel,
  AdminBoundaryLoadStatus,
} from "@/types/admin-boundary";

type UseAdminBoundariesResult = {
  boundaries: AdminBoundaryFeatureCollection | null;
  status: AdminBoundaryLoadStatus;
};

type StoredAdminBoundaryState = {
  countryCode: string;
  level: AdminBoundaryLevel;
  boundaries: AdminBoundaryFeatureCollection | null;
  status: Exclude<AdminBoundaryLoadStatus, "idle" | "loading">;
};

export function useAdminBoundaries(
  countryCode: string | null,
  level: AdminBoundaryLevel = "ADM1",
): UseAdminBoundariesResult {
  const [storedState, setStoredState] = useState<StoredAdminBoundaryState | null>(null);

  useEffect(() => {
    if (!countryCode) {
      return;
    }

    const abortController = new AbortController();

    fetchAdminBoundaries(countryCode, level, abortController.signal)
      .then((nextBoundaries) => {
        if (!nextBoundaries) {
          setStoredState({
            countryCode,
            level,
            boundaries: null,
            status: "unsupported",
          });
          return;
        }

        setStoredState({
          countryCode,
          level,
          boundaries: nextBoundaries,
          status: "success",
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStoredState({
          countryCode,
          level,
          boundaries: null,
          status: "error",
        });
      });

    return () => abortController.abort();
  }, [countryCode, level]);

  if (!countryCode) {
    return { boundaries: null, status: "idle" };
  }

  if (!storedState || storedState.countryCode !== countryCode || storedState.level !== level) {
    return { boundaries: null, status: "loading" };
  }

  return {
    boundaries: storedState.boundaries,
    status: storedState.status,
  };
}
