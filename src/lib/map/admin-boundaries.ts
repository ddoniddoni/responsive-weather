import type {
  AdminBoundaryFeature,
  AdminBoundaryFeatureCollection,
} from "@/types/admin-boundary";

export type AdminBoundaryBounds = {
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
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

function collectCoordinatePositions(value: unknown, positions: Array<[number, number]>) {
  if (!Array.isArray(value)) {
    return;
  }

  const [longitude, latitude] = value;

  if (typeof longitude === "number" && typeof latitude === "number") {
    if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
      positions.push([longitude, latitude]);
    }

    return;
  }

  for (const entry of value) {
    collectCoordinatePositions(entry, positions);
  }
}

export function parseAdminBoundaryCollection(value: unknown): AdminBoundaryFeatureCollection {
  if (!isRecord(value) || value.type !== "FeatureCollection" || !Array.isArray(value.features)) {
    throw new Error("Invalid administrative boundary GeoJSON response.");
  }

  const features = value.features.filter(isAdminBoundaryFeature);

  return {
    type: "FeatureCollection",
    features,
  };
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

export function getAdminBoundaryCenter(feature: AdminBoundaryFeature): [number, number] | null {
  if (!isRecord(feature.geometry) || !("coordinates" in feature.geometry)) {
    return null;
  }

  const positions: Array<[number, number]> = [];

  collectCoordinatePositions(feature.geometry.coordinates, positions);

  if (positions.length === 0) {
    return null;
  }

  let minLongitude = positions[0][0];
  let maxLongitude = positions[0][0];
  let minLatitude = positions[0][1];
  let maxLatitude = positions[0][1];

  for (const [longitude, latitude] of positions) {
    minLongitude = Math.min(minLongitude, longitude);
    maxLongitude = Math.max(maxLongitude, longitude);
    minLatitude = Math.min(minLatitude, latitude);
    maxLatitude = Math.max(maxLatitude, latitude);
  }

  return [(minLongitude + maxLongitude) / 2, (minLatitude + maxLatitude) / 2];
}

export function getAdminBoundaryCollectionBounds(
  collection: AdminBoundaryFeatureCollection,
): AdminBoundaryBounds | null {
  const positions: Array<[number, number]> = [];

  for (const feature of collection.features) {
    if (!isRecord(feature.geometry) || !("coordinates" in feature.geometry)) {
      continue;
    }

    collectCoordinatePositions(feature.geometry.coordinates, positions);
  }

  if (positions.length === 0) {
    return null;
  }

  let minLongitude = positions[0][0];
  let maxLongitude = positions[0][0];
  let minLatitude = positions[0][1];
  let maxLatitude = positions[0][1];

  for (const [longitude, latitude] of positions) {
    minLongitude = Math.min(minLongitude, longitude);
    maxLongitude = Math.max(maxLongitude, longitude);
    minLatitude = Math.min(minLatitude, latitude);
    maxLatitude = Math.max(maxLatitude, latitude);
  }

  return {
    minLongitude,
    maxLongitude,
    minLatitude,
    maxLatitude,
  };
}
