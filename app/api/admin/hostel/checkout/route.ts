import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { allocationId, status, notes } = body;

    if (!allocationId) {
      return formatResponse(false, null, "Allocation ID is required", 400);
    }

    // Process the checkout in a transaction to maintain data integrity
    const updatedAllocation = await prisma.$transaction(async (tx) => {
      
      // 1. Check if the allocation exists and is currently active
      const existing = await tx.hostelAllocation.findUnique({
        where: { id: allocationId },
        include: { room: true }
      });

      if (!existing) {
        throw new Error("Allocation record not found");
      }

      if (existing.status === "INACTIVE") {
        throw new Error("Resident is already checked out");
      }

      // 2. Update the allocation to INACTIVE
      const allocation = await tx.hostelAllocation.update({
        where: { id: allocationId },
        data: {
          status: status || "INACTIVE",
          endDate: new Date(),
          // If you add a notes field to your schema, you can save exit remarks here
        },
      });

      // 3. Optional: Logic for "HostelMember" status
      // We keep the member ACTIVE so they can be re-assigned later, 
      // but you could set it to INACTIVE if they are leaving the school.
      
      return allocation;
    });

    try { await cacheDel(`admin:allocate:${allocationId || 'global'}:*`); } catch (e) {}

    return formatResponse(true, updatedAllocation, "Resident checked out successfully", 200);

  } catch (error: any) {
    console.error("[CHECKOUT_PATCH_ERROR]", error);
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}