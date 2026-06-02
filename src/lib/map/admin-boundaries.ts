import type {
  AdminBoundaryFeature,
  AdminBoundaryFeatureCollection,
} from "@/types/admin-boundary";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAdminBoundaryFeature(value: unknown): value is AdminBoundaryFeature {
  if (!isRecord(value) || value.type !== "Feature" || !isRecord(value.properties)) {
    return false;
  }

  return "geometry" in value;
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
