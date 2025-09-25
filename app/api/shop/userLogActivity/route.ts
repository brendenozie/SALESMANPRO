import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// import { requireAuth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { formatResponse, verifyAuth } from "@/lib/verifyAuth";

// Optional: Define allowed action types
const VALID_ACTIONS = ["view", "purchase", "favorite"];

export async function POST(req: Request) {
  try {
    
       const auth = await verifyAuth(req);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const ip = req.headers.get("x-forwarded-for") || "local";
    
      if (!rateLimit(ip)) {
        return NextResponse.json({ message: "Too many requests" }, { status: 429 });
      }
    
      // const authResult = await requireAuth(req);
      // if (authResult instanceof Response) return authResult;
    

    const body = await req.json();
    const { userId, productId, action } = body;

    if (!userId || !productId || !action) {
      return NextResponse.json(
        { error: "Missing userId, productId, or action" },
        { status: 400 }
      );
    }

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action type. Allowed: ${VALID_ACTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    await prisma.userActivity.create({
      data: {
        userId,
        productId,
        action,
      },
    });

    return NextResponse.json(
      { message: "User activity logged successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error logging user activity:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}
