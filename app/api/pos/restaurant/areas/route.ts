import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { listRestaurantAreas, createRestaurantArea } from "@/lib/pos/restaurantService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId parameter", 400);
    }

    const areas = await listRestaurantAreas(companyId);
    return formatResponse(true, areas, "Restaurant areas retrieved", 200);
  } catch (error: any) {
    console.error("[RESTAURANT_AREAS_GET_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to get areas", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, name, description } = body;

    if (!companyId || !name) {
      return formatResponse(false, null, "companyId and name are required", 400);
    }

    const area = await createRestaurantArea(companyId, name, description);
    return formatResponse(true, area, "Area created successfully", 201);
  } catch (error: any) {
    console.error("[RESTAURANT_AREAS_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to create area", 500);
  }
}
