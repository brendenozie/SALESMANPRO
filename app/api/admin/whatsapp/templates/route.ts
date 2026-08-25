import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { WhatsAppTemplateCategory } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is missing", 400);
  }

  const cacheKey = `admin:whatsapp:templates:${companyId}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const response = formatResponse(
        true,
        cached,
        "Fetched templates (Cached)",
        200,
      );
      response.headers.set(
        "Cache-Control",
        "private, s-maxage=60, stale-while-revalidate=120",
      );
      return response;
    }
  } catch (e) {}

  try {
    const rawTemplates = await prisma.whatsAppTemplate.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });

    const formattedTemplates = rawTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      language: t.language,
      status: t.status,
      headerText:
        typeof t.header === "object" && t.header !== null
          ? (t.header as any).text
          : "",
      bodyText: t.body || "",
      footerText: t.footer || "",
      variables: Array.isArray(t.variables) ? (t.variables as string[]) : [],
      createdAt: t.createdAt.toISOString(),
    }));

    try {
      await cacheSet(cacheKey, formattedTemplates, 120);
    } catch (e) {}

    const response = formatResponse(
      true,
      formattedTemplates,
      "Templates fetched successfully",
      200,
    );
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=60, stale-while-revalidate=120",
    );
    return response;
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to fetch WhatsApp templates",
      500,
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      name,
      category,
      language,
      headerText,
      bodyText,
      footerText,
      variables,
    } = body;

    if (!companyId || !name || !bodyText) {
      return formatResponse(
        false,
        null,
        "Missing required template payload fields",
        400,
      );
    }

    const createdTemplate = await prisma.whatsAppTemplate.create({
      data: {
        companyId,
        name: name.toLowerCase().replace(/\s+/g, "_"),
        category: category as WhatsAppTemplateCategory,
        language: language || "en_US",
        status: "PENDING",
        header: headerText ? { type: "TEXT", text: headerText } : undefined,
        body: bodyText,
        footer: footerText || undefined,
        variables: variables || [],
      },
    });

    const formatted = {
      id: createdTemplate.id,
      name: createdTemplate.name,
      category: createdTemplate.category,
      language: createdTemplate.language,
      status: createdTemplate.status,
      headerText: headerText || "",
      bodyText: createdTemplate.body || "",
      footerText: createdTemplate.footer || "",
      variables: Array.isArray(createdTemplate.variables)
        ? (createdTemplate.variables as string[])
        : [],
      createdAt: createdTemplate.createdAt.toISOString(),
    };

    try {
      await cacheDel(`admin:whatsapp:templates:${companyId}`);
    } catch (e) {}

    return formatResponse(
      true,
      formatted,
      "Template submitted for Meta approval",
      201,
    );
  } catch (error) {
    return formatResponse(false, null, "Failed to create template", 500);
  }
}
