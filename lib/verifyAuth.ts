// verifyAuth.ts
import { jwtVerify, JWTPayload } from "jose";

export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
}

export async function verifyAuth(request: Request): Promise<AuthResult> {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return { success: false, error: "Missing authorization token" };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return { success: true, user: payload };
  } catch (error) {
    console.error("Auth verification failed:", error);
    return { success: false, error: "Invalid or expired token" };
  }
}
