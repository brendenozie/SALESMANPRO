// app/api/patient/profile/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheDel, cacheGet, cacheSet } from "@/lib/cache"; 

// Helper function to format patient data
async function formatPatientProfile(user: any) {
  return {
    id: user.id,
    name: user.name || "N/A",
    email: user.email || "N/A",
    phone: user.phone || "N/A",
    profilePicture:
      user.profilePicture ||
      "https://placehold.co/100x100/A7F3D0/0D9488?text=PT",
    createdAt: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "N/A",
    updatedAt: user.updatedAt
      ? new Date(user.updatedAt).toLocaleDateString()
      : "N/A",
  };
}

async function getHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return formatResponse(false, null, "Missing patientId", 400);
  }

  const cacheKey = `patient:profile:${patientId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    const user = await prisma.user.findUnique({
      where: { id: patientId },
      // include: { consumerProfile: true }, // uncomment if needed
    });

    if (!user) {
      return formatResponse(false, null, "Patient (User) not found", 404);
    }

    const formattedProfile = await formatPatientProfile(user);
    try {
      await cacheSet(cacheKey, formattedProfile, 60);
    } catch (e) {
      console.error("Failed to cache patient profile data:", e);
    }
    return formatResponse(true, formattedProfile);
  } catch (err: any) {
    console.error("GET /api/patient/profile error:", err);
    return formatResponse(
      false,
      null,
      err.message || "Internal server error",
      500
    );
  }
}

async function putHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");
  const body = await request.json();
  const { name, email, phone, profilePicture } = body;

  if (!patientId) {
    return formatResponse(false, null, "Missing patientId", 400);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: patientId },
      data: { name, email, phone, profilePicture },
      // include: { consumerProfile: true }, // uncomment if needed
    });

    const formattedUpdatedProfile = await formatPatientProfile(updatedUser);
    //invalidate cache
    try {      await cacheDel(`patient:profile:${patientId}`);
    } catch (e) {
      console.error("Failed to invalidate patient profile cache:", e);
    }
    
    return formatResponse(true, formattedUpdatedProfile);
  } catch (err: any) {
    console.error("PUT /api/patient/profile error:", err);

    if (err.code === "P2002" && err.meta?.target?.includes("email")) {
      return formatResponse(
        false,
        null,
        "An account with this email already exists.",
        409
      );
    }

    return formatResponse(
      false,
      null,
      err.message || "Internal server error",
      500
    );
  }
}

export const GET = withApiHandler(getHandler);
export const PUT = withApiHandler(putHandler);
