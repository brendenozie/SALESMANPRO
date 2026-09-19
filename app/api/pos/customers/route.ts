import { NextResponse } from "next/server";
import { searchPOSCustomers, createPOSCustomer } from "@/lib/pos/posCustomerService";
import { formatResponse } from "@/lib/formatResponse";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const query = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId query parameter", 400);
    }

    const customers = await searchPOSCustomers({
      companyId,
      query,
      limit,
    });

    return formatResponse(true, customers, "Customers retrieved successfully", 200);
  } catch (error: any) {
    console.error("[POS_CUSTOMERS_GET_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to search customers", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { companyId, name, phone, email, address, notes } = body;

    if (!companyId || !name) {
      return formatResponse(
        false,
        null,
        "Missing required fields: companyId and name",
        400
      );
    }

    const result = await createPOSCustomer({
      companyId,
      name,
      phone,
      email,
      address,
      notes,
    });

    if (result.duplicate) {
      return formatResponse(
        true,
        result,
        result.message || "Customer already exists",
        200
      );
    }

    return formatResponse(true, result, "Customer created successfully", 201);
  } catch (error: any) {
    console.error("[POS_CUSTOMERS_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to create customer", 400);
  }
}
