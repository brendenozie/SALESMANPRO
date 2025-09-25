import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function verifyAuth(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return { success: false, error: "Missing authorization token" };

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return { success: true, user: payload }; // user data available here
  } catch (error) {
    console.error("Auth verification failed:", error);
    return { success: false, error: "Invalid or expired token" };
  }
}

// -----------------------------
// Shared Helpers
// --
export const formatResponse = (success: boolean, data?: any, error?: any, status: number = 200) =>
  NextResponse.json({ success, data, error }, { status });
