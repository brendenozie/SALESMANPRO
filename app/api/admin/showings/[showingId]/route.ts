// app/api/showings/[showingId]/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/showings/[showingId]
async function getShowing(req: Request, { params }: { params: { showingId: string } }) {
 

  const { showingId } = params;

  try {
    const showing = await prisma.showing.findUnique({
      where: { id: showingId },
      // include related data if needed
    });

    if (!showing) return formatResponse(false, null, "Showing not found", 404);
    return formatResponse(true, showing, "Showing fetched successfully", 200);
  } catch (error: any) {
    console.error(`Error fetching showing with ID ${showingId}:`, error);
    return formatResponse(false, null, "Failed to fetch showing", 500);
  }
}

// PATCH /api/showings/[showingId]
async function updateShowing(req: Request, { params }: { params: { showingId: string } }) {
 
  const { showingId } = params;

  try {
    const body = await req.json();
    const {
      propertyId,
      propertyName,
      clientId,
      clientName,
      agentId,
      agentName,
      dateTime,
      status,
      notes,
    } = body;

    const updateData: { [key: string]: any } = {};
    if (propertyId) updateData.propertyId = propertyId;
    if (propertyName) updateData.propertyName = propertyName;
    if (clientId) updateData.clientId = clientId;
    if (clientName) updateData.clientName = clientName;
    if (agentId) updateData.agentId = agentId;
    if (agentName) updateData.agentName = agentName;
    if (dateTime) {
      if (isNaN(new Date(dateTime).getTime())) {
        return formatResponse(false, null, "Invalid dateTime format. Must be a valid date string.", 400);
      }
      updateData.dateTime = new Date(dateTime);
    }
    if (status) {
      const validStatuses = ["Scheduled", "Completed", "Canceled"];
      if (!validStatuses.includes(status)) {
        return formatResponse(false, null, `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
      }
      updateData.status = status;
    }
    if (notes !== undefined) updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      return formatResponse(false, null, "No fields provided for update", 400);
    }

    const updatedShowing = await prisma.showing.update({
      where: { id: showingId },
      data: updateData,
    });

    return formatResponse(true, updatedShowing, "Showing updated successfully", 200);
  } catch (error: any) {
    console.error(`Error updating showing with ID ${showingId}:`, error);
    if (error.code === "P2025") {
      return formatResponse(false, null, "Showing not found or referenced data invalid", 404);
    }
    return formatResponse(false, null, "Failed to update showing", 500);
  }
}

// DELETE /api/showings/[showingId]
async function deleteShowing(req: Request, { params }: { params: { showingId: string } }) {
  
  const { showingId } = params;

  try {
    await prisma.showing.delete({ where: { id: showingId } });
    return formatResponse(true, null, "Showing deleted successfully", 200);
  } catch (error: any) {
    console.error(`Error deleting showing with ID ${showingId}:`, error);
    if (error.code === "P2025") {
      return formatResponse(false, null, "Showing not found", 404);
    }
    return formatResponse(false, null, "Failed to delete showing", 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getShowing);
export const PATCH = withApiHandler(updateShowing);
export const DELETE = withApiHandler(deleteShowing);
