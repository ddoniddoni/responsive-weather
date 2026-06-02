import "server-only";

import { parseAdminBoundaryCollection } from "@/lib/map/admin-boundaries";
import type { AdminBoundaryFeatureCollection, AdminBoundaryLevel } from "@/types/admin-boundary";

const GEOBOUNDARIES_API_BASE_URL = "https://www.geoboundaries.org/api/current/gbOpen";
const ADMIN_BOUNDARY_REVALIDATE_SECONDS = 60 * 60 * 24 * 7;

type GeoBoundariesMetadata = {
  gjDownloadURL: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseGeoBoundariesMetadata(value: unknown): GeoBoundariesMetadata {
  if (!isRecord(value) || typeof value.gjDownloadURL !== "string") {
    throw new Error("Invalid geoBoundaries metadata response.");
  }

  return {
    gjDownloadURL: value.gjDownloadURL,
  };
}

export async function fetchAdminBoundaries(
  countryCode: string,
  level: AdminBoundaryLevel,
): Promise<AdminBoundaryFeatureCollection | null> {
  const metadataUrl = `${GEOBOUNDARIES_API_BASE_URL}/${countryCode}/${level}/`;
  const metadataResponse = await fetch(metadataUrl, {
    next: { revalidate: ADMIN_BOUNDARY_REVALIDATE_SECONDS },
  });

  if (metadataResponse.status === 404) {
    return null;
  }

  if (!metadataResponse.ok) {
    throw new Error(`Failed to fetch ${level} metadata for ${countryCode}.`);
  }

  const metadata = parseGeoBoundariesMetadata(await metadataResponse.json());
  const boundaryResponse = await fetch(metadata.gjDownloadURL, {
    cache: "no-store",
  });

  if (!boundaryResponse.ok) {
    throw new Error(`Failed to fetch ${level} boundaries for ${countryCode}.`);
  }

  const collection = parseAdminBoundaryCollection(await boundaryResponse.json());

  if (collection.features.length === 0) {
    return null;
  }

  return collection;
}
