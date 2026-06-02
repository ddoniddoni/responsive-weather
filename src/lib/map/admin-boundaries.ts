import type {
  AdminBoundaryFeature,
  AdminBoundaryFeatureCollection,
  AdminBoundaryLevel,
} from "@/types/admin-boundary";

const GEOBOUNDARIES_API_BASE_URL = "https://www.geoboundaries.org/api/current/gbOpen";

type GeoBoundariesMetadata = {
  gjDownloadURL: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAdminBoundaryFeature(value: unknown): value is AdminBoundaryFeature {
  if (!isRecord(value) || value.type !== "Feature" || !isRecord(value.properties)) {
    return false;
  }

  return "geometry" in value;
}

function parseGeoBoundariesMetadata(value: unknown): GeoBoundariesMetadata {
  if (!isRecord(value) || typeof value.gjDownloadURL !== "string") {
    throw new Error("Invalid geoBoundaries metadata response.");
  }

  return {
    gjDownloadURL: value.gjDownloadURL,
  };
}

function parseAdminBoundaryCollection(value: unknown): AdminBoundaryFeatureCollection {
  if (!isRecord(value) || value.type !== "FeatureCollection" || !Array.isArray(value.features)) {
    throw new Error("Invalid administrative boundary GeoJSON response.");
  }

  const features = value.features.filter(isAdminBoundaryFeature);

  return {
    type: "FeatureCollection",
    features,
  };
}

export async function fetchAdminBoundaries(
  countryCode: string,
  level: AdminBoundaryLevel,
  signal?: AbortSignal,
): Promise<AdminBoundaryFeatureCollection | null> {
  const metadataUrl = `${GEOBOUNDARIES_API_BASE_URL}/${countryCode}/${level}/`;
  const metadataResponse = await fetch(metadataUrl, { signal });

  if (metadataResponse.status === 404) {
    return null;
  }

  if (!metadataResponse.ok) {
    throw new Error(`Failed to fetch ${level} metadata for ${countryCode}.`);
  }

  const metadata = parseGeoBoundariesMetadata(await metadataResponse.json());
  const boundaryResponse = await fetch(metadata.gjDownloadURL, { signal });

  if (!boundaryResponse.ok) {
    throw new Error(`Failed to fetch ${level} boundaries for ${countryCode}.`);
  }

  const collection = parseAdminBoundaryCollection(await boundaryResponse.json());

  if (collection.features.length === 0) {
    return null;
  }

  return collection;
}

export function getAdminBoundaryName(feature: AdminBoundaryFeature) {
  const { shapeName, shapeISO, shapeID } = feature.properties;

  if (typeof shapeName === "string" && shapeName.trim().length > 0) {
    return shapeName;
  }

  if (typeof shapeISO === "string" && shapeISO.trim().length > 0) {
    return shapeISO;
  }

  if (typeof shapeID === "string" && shapeID.trim().length > 0) {
    return shapeID;
  }

  return "Administrative area";
}

export function getAdminBoundaryCode(feature: AdminBoundaryFeature) {
  const { shapeISO, shapeID, shapeName } = feature.properties;

  if (typeof shapeISO === "string" && shapeISO.trim().length > 0) {
    return shapeISO;
  }

  if (typeof shapeID === "string" && shapeID.trim().length > 0) {
    return shapeID;
  }

  if (typeof shapeName === "string" && shapeName.trim().length > 0) {
    return shapeName;
  }

  return String(feature.id ?? "admin-boundary");
}
