import { NextRequest, NextResponse } from "next/server";
import { getAvailableBuses, locations } from "@/lib/buses";

// GET /api/buses?from=X&to=Y
export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") || "";
  const to = req.nextUrl.searchParams.get("to") || "";

  if (!from || !to) {
    return NextResponse.json(
      { error: "From and To locations are required" },
      { status: 400 }
    );
  }

  const buses = getAvailableBuses(from, to);
  return NextResponse.json({ buses, from, to });
}

// POST /api/buses - Get list of locations
export async function POST() {
  return NextResponse.json({ locations });
}
