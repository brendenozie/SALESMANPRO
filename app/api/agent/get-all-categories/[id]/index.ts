

// app/api/admin/cities/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET city by ID
async function getCity(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const cityId = params.id;

  try {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      return formatResponse(false, null, "City not found", 404);
    }

    return formatResponse(true, city, "City fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching city:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE city by ID
async function deleteCity(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const cityId = params.id;

  try {
    await prisma.city.delete({
      where: { id: cityId },
    });

    return formatResponse(true, { id: cityId }, "City deleted successfully", 200);
  } catch (error) {
    console.error("Error deleting city:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// UPDATE city by ID
async function updateCity(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const cityId = params.id;
  const body = await req.json();

  try {
    const updatedCity = await prisma.city.update({
      where: { id: cityId },
      data: {
        cityName: body.cityName,
        publicId: body.publicId,
        url: body.url,
        status: body.status,
      },
    });

    return formatResponse(true, updatedCity, "City updated successfully", 200);
  } catch (error) {
    console.error("Error updating city:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiHandler(getCity);
export const DELETE = withApiHandler(deleteCity);
export const PUT = withApiHandler(updateCity);

