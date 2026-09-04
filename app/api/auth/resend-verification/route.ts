import { NextRequest, NextResponse } from "next/server";
import { resendVerificationEmail } from "@/lib/auth/verification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const callbackUrl = body.callbackUrl ? String(body.callbackUrl) : undefined;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const result = await resendVerificationEmail(email, callbackUrl);

    if (!result.success) {
      const status = result.cooldownRemainingSeconds ? 429 : 400;
      return NextResponse.json(
        {
          ok: false,
          error: result.message,
          cooldownRemainingSeconds: result.cooldownRemainingSeconds,
        },
        { status }
      );
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      alreadyVerified: result.alreadyVerified ?? false,
    });
  } catch (err: any) {
    console.error("[ResendVerification API] Error:", err);
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
