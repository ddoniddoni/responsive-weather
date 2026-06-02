export type AdminBoundaryLevel = "ADM1" | "ADM2";

export type AdminBoundaryFeatureProperties = Record<string, unknown> & {
  shapeGroup?: string;
  shapeID?: string;
  shapeISO?: string;
  shapeName?: string;
  shapeType?: string;
};

export type AdminBoundaryFeature = {
  type: "Feature";
  id?: string | number;
  properties: AdminBoundaryFeatureProperties;
  geometry: unknown;
};

export type AdminBoundaryFeatureCollection = {
  type: "FeatureCollection";
  features: AdminBoundaryFeature[];
};

export type AdminBoundaryLoadStatus = "idle" | "loading" | "success" | "error" | "unsupported";
