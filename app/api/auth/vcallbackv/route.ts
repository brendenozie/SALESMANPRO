import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { createHandoverToken, safeHandoverTarget } from "@/lib/auth/handover";
import { HUB_URL } from "@/lib/auth/domain";

export async function GET(req: NextRequest) {
  const rawTarget = req.nextUrl.searchParams.get("target") || HUB_URL;
  const target = await safeHandoverTarget(rawTarget);
  if (!target) {
    return NextResponse.redirect(`${HUB_URL}/unauthorized?reason=invalid_callback`);
  }

  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.redirect(`${target.origin}${target.pathname}?auth=failed`);
    }

    const { token } = await createHandoverToken({
      id: String((session.user as any).id),
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: (session.user as any).role,
      emailVerified: (session.user as any).emailVerified,
      companyId: (session.user as any).companyId,
      hasTenantAccess: (session.user as any).hasTenantAccess,
    });

    const destination = new URL(target.toString());
    destination.searchParams.set("auth_token", token);
    destination.searchParams.set("auth", "success");
    return NextResponse.redirect(destination.toString());
  } catch {
    return NextResponse.redirect(`${target.origin}${target.pathname}?auth=error`);
  }
}
