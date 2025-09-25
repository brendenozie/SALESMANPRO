// app/api/admin/[adminSlug]/inventory/items/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, id } = params;

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
      select: {
        id: true,
        quantity: true,
        reorderThreshold: true,
        createdAt: true,
        updatedAt: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            productCategory: { select: { name: true } }
          }
        },
        inventoryLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        }
      },
    });

    if (!inventoryItem) {
      return NextResponse.json({ message: "Inventory item not found or not associated with this company" }, { status: 404 });
    }

    const formattedItem = {
      ...inventoryItem,
      name: inventoryItem.product?.name || 'N/A',
      category: inventoryItem.product?.productCategory?.name || 'Uncategorized',
      minStock: inventoryItem.reorderThreshold || 0,
      lastUpdated: new Date(inventoryItem.updatedAt || '').toISOString().split('T')[0],
      logs: inventoryItem.inventoryLogs.map(log => ({
        ...log,
        createdAt: new Date(log.createdAt || '').toLocaleString(),
      })),
    };

    return NextResponse.json(formattedItem, { status: 200 });

  } catch (error) {
    console.error("Error fetching inventory item details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, id } = params;
  const body = await request.json();

  const { quantity, reorderThreshold } = body; // Allow updating quantity directly or reorder threshold

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const itemToUpdate = await prisma.inventoryItem.findUnique({
        where: {
            id: id,
            companyId: company.id,
        },
        select: { id: true, quantity: true } // Select current quantity for logging delta
    });

    if (!itemToUpdate) {
        return NextResponse.json({ message: "Inventory item not found or not associated with this company" }, { status: 404 });
    }

    let updateData: any = { updatedAt: new Date() };

    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (reorderThreshold !== undefined) updateData.reorderThreshold = parseInt(reorderThreshold);

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: id },
      data: updateData,
    });

    // Optionally create an InventoryLog for manual adjustments
    if (quantity !== undefined && parseInt(quantity) !== itemToUpdate.quantity) {
        await prisma.inventoryLog.create({
            data: {
                inventoryId: updatedItem.id,
                action: "MANUAL_ADJUSTMENT",
                quantity: parseInt(quantity) - itemToUpdate.quantity, // Log the delta
                // Add userId if you have an admin user context
            }
        });
    }


    return NextResponse.json(
      { message: "Inventory item updated successfully", item: updatedItem },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const itemToDelete = await prisma.inventoryItem.findUnique({
        where: {
            id: id,
            companyId: company.id,
        },
        select: { id: true }
    });

    if (!itemToDelete) {
        return NextResponse.json({ message: "Inventory item not found or not associated with this company" }, { status: 404 });
    }

    // Delete associated logs first if onDelete is not Cascade
    await prisma.inventoryLog.deleteMany({
        where: { inventoryId: id }
    });

    await prisma.inventoryItem.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Inventory item deleted successfully" }, { status: 204 });

  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}