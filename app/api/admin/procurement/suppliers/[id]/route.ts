import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: { orderBy: { issueDate: "desc" }, take: 10 },
        bills: { orderBy: { dueDate: "asc" } },
      },
    });

    if (!supplier) {
      return formatResponse(false, null, "Supplier not found", 404);
    }

    return formatResponse(true, supplier, "Supplier retrieved successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to fetch supplier", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.contactPerson !== undefined && { contactPerson: body.contactPerson }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.taxPin !== undefined && { taxPin: body.taxPin }),
        ...(body.category && { category: body.category }),
        ...(body.paymentTerms && { paymentTerms: body.paymentTerms }),
        ...(body.status && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return formatResponse(true, supplier, "Supplier updated successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to update supplier", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.supplier.delete({ where: { id } });
    return formatResponse(true, null, "Supplier deleted successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to delete supplier", 500);
  }
}
