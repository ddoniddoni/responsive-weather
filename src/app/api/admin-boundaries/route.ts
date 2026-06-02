import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBoundaries } from "@/lib/map/admin-boundaries.server";
import type { AdminBoundaryLevel } from "@/types/admin-boundary";

const CACHE_CONTROL_VALUE = "public, s-maxage=604800, stale-while-revalidate=604800";

function normalizeCountryCode(value: string | null) {
  const countryCode = value?.trim().toUpperCase();

  if (!countryCode || !/^[A-Z]{3}$/.test(countryCode)) {
    return null;
  }

  return countryCode;
}

function normalizeBoundaryLevel(value: string | null): AdminBoundaryLevel | null {
  if (!value) {
    return "ADM1";
  }

  if (value === "ADM1" || value === "ADM2") {
    return value;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const countryCode = normalizeCountryCode(searchParams.get("countryCode"));
  const level = normalizeBoundaryLevel(searchParams.get("level"));

  if (!countryCode || !level) {
    return NextResponse.json(
      { error: "A valid ISO3 countryCode and boundary level are required." },
      { status: 400 },
    );
  }

  try {
    const boundaries = await fetchAdminBoundaries(countryCode, level);

    if (!boundaries) {
      return NextResponse.json(
        { error: "Administrative boundaries are not available for this selection." },
        { status: 404 },
      );
    }

    return NextResponse.json(boundaries, {
      headers: {
        "Cache-Control": CACHE_CONTROL_VALUE,
      },
    });
  } catch (error) {
    console.error(`Failed to proxy ${level} boundaries for ${countryCode}.`, error);

    return NextResponse.json(
      { error: "Administrative boundaries could not be loaded." },
      { status: 502 },
    );
  }
}
