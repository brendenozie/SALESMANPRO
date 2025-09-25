// app/api/admin/[adminSlug]/inventory/items/[id]/restock/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, id } = params;
  const body = await request.json();

  const { quantityAdded, reason, userId } = body; // userId of the admin performing the restock

  if (quantityAdded === undefined || quantityAdded <= 0) {
    return NextResponse.json({ message: "Quantity to add must be a positive number" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id: id,
        companyId: company.id, // Ensure item belongs to this company
      },
      select: { id: true, quantity: true },
    });

    if (!inventoryItem) {
      return NextResponse.json({ message: "Inventory item not found or not associated with this company" }, { status: 404 });
    }

    // Update the quantity of the inventory item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: id },
      data: {
        quantity: { increment: parseInt(quantityAdded) },
        updatedAt: new Date(),
      },
    });

    // Create an InventoryLog entry for the restock
    const logEntry = await prisma.inventoryLog.create({
      data: {
        inventoryId: updatedItem.id,
        action: "RESTOCK",
        quantity: parseInt(quantityAdded),
        details: reason, // Store the reason in details
        // userId: userId, // Link to the admin user who performed the restock
      },
    });

    return NextResponse.json(
      {
        message: `Successfully restocked ${quantityAdded} units of ${updatedItem.id}.`,
        newStock: updatedItem.quantity,
        logId: logEntry.id,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error restocking inventory item:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}