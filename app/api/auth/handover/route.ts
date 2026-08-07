import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, MAIN_DOMAINS } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { randomBytes } from "crypto";

async function isAllowedTarget(targetUrl: URL): Promise<boolean> {
  const targetHost = targetUrl.hostname.toLowerCase().replace(/^www\./, "");

  if (
    MAIN_DOMAINS.includes(targetHost) ||
    targetHost.endsWith(".salesmanpro.site")
  ) {
    return true;
  }

  const registeredCompany = await prisma.company.findFirst({
    where: {
      OR: [{ domain: targetHost }, { customDomain: targetHost }],
    },
  });

  return !!registeredCompany;
}

export async function GET(req: NextRequest) {
  const rawTarget =
    req.nextUrl.searchParams.get("target") ||
    "https://salesmanpro.site/dashboards";
  const decodedTarget = decodeURIComponent(rawTarget);

  let targetUrl: URL;
  try {
    targetUrl = new URL(decodedTarget);
  } catch {
    return NextResponse.redirect(
      "https://salesmanpro.site/failure?reason=invalid_target",
    );
  }

  const isValidDomain = await isAllowedTarget(targetUrl);
  if (!isValidDomain) {
    return NextResponse.redirect(
      "https://salesmanpro.site/failure?reason=unauthorized_domain",
    );
  }

  if (req.nextUrl.searchParams.get("auth") === "logout") {
    return NextResponse.redirect(targetUrl.toString());
  }

  try {
    const session = await getAuthSession();

    if (!session || !session.user) {
      targetUrl.searchParams.set("auth", "failed");
      return NextResponse.redirect(targetUrl.toString());
    }

    const exchangeCode = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: (session.user as any).id || session.user.email!,
        token: exchangeCode,
        expires,
      },
    });

    const exchangeUrl = new URL("/api/auth/exchange", targetUrl.origin);
    exchangeUrl.searchParams.set("code", exchangeCode);
    exchangeUrl.searchParams.set(
      "destination",
      targetUrl.pathname + targetUrl.search,
    );

    return NextResponse.redirect(exchangeUrl.toString());
  } catch (error) {
    console.error("Handover Processing Error:", error);
    targetUrl.searchParams.set("auth", "error");
    return NextResponse.redirect(targetUrl.toString());
  }
}
