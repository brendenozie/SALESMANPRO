import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import {
  listRestaurantAreas,
  createRestaurantArea,
  updateRestaurantArea,
  deleteRestaurantArea,
} from "@/lib/pos/restaurantService";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

async function resolveCompanyId(companyId: string): Promise<string> {
  if (/^[0-9a-fA-F]{24}$/.test(companyId)) {
    return companyId;
  }
  const comp = await prisma.company.findFirst({
    where: { OR: [{ slug: companyId }, { id: companyId }] },
    select: { id: true },
  });
  return comp?.id || companyId;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCompanyId = searchParams.get("companyId");

    if (!rawCompanyId) {
      return formatResponse(false, null, "Missing companyId parameter", 400);
    }

    const companyId = await resolveCompanyId(rawCompanyId);
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
    const { companyId: rawCompanyId, name, description } = body;

    if (!rawCompanyId || !name) {
      return formatResponse(false, null, "companyId and name are required", 400);
    }

    const companyId = await resolveCompanyId(rawCompanyId);
    const area = await createRestaurantArea(companyId, name, description);
    return formatResponse(true, area, "Area created successfully", 201);
  } catch (error: any) {
    console.error("[RESTAURANT_AREAS_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to create area", 500);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { companyId: rawCompanyId, areaId, name, description, sortOrder, isActive } = body;

    if (!areaId) {
      return formatResponse(false, null, "areaId is required", 400);
    }

    const companyId = rawCompanyId ? await resolveCompanyId(rawCompanyId) : "";
    const updated = await updateRestaurantArea(companyId, areaId, {
      name,
      description,
      sortOrder,
      isActive,
    });

    return formatResponse(true, updated, "Area updated successfully", 200);
  } catch (error: any) {
    console.error("[RESTAURANT_AREAS_PUT_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to update area", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const areaId = searchParams.get("areaId");
    const rawCompanyId = searchParams.get("companyId");

    if (!areaId) {
      return formatResponse(false, null, "areaId parameter is required", 400);
    }

    const companyId = rawCompanyId ? await resolveCompanyId(rawCompanyId) : "";
    await deleteRestaurantArea(companyId, areaId);

    return formatResponse(true, null, "Area deleted successfully", 200);
  } catch (error: any) {
    console.error("[RESTAURANT_AREAS_DELETE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to delete area", 500);
  }
}
