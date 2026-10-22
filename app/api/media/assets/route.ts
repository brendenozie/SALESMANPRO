/**
 * app/api/media/assets/route.ts
 *
 * Store Media Library API.
 * Provides tenant-isolated listing, filtering, search, and reference-aware deletion
 * for the Central Media Manager and storefront media consumers.
 */

import { NextResponse, NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { getStoreMediaLibrary, deleteMediaAsset } from "@/lib/media/centralMediaService";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const { searchParams } = new URL(req.url);

    const explicitCompanyId = searchParams.get("companyId");
    const type = (searchParams.get("type") || undefined) as any;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || "READY";
    const cursor = searchParams.get("cursor") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 30;

    let companyId = "public";
    if (auth.success && auth.user) {
      companyId = (auth.user.companyId || explicitCompanyId || auth.user.id || "seller").toString();
    } else if (explicitCompanyId) {
      companyId = explicitCompanyId.replace(/[^a-zA-Z0-9_-]/g, "");
    }

    const result = await getStoreMediaLibrary({
      companyId,
      type,
      search,
      status,
      cursor,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("[MEDIA_ASSETS_GET_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve store media" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("id");
    const explicitCompanyId = searchParams.get("companyId");
    const force = searchParams.get("force") === "true";

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter 'id'" },
        { status: 400 }
      );
    }

    let companyId = "public";
    if (auth.success && auth.user) {
      companyId = (auth.user.companyId || explicitCompanyId || auth.user.id || "seller").toString();
    } else if (explicitCompanyId) {
      companyId = explicitCompanyId.replace(/[^a-zA-Z0-9_-]/g, "");
    }

    const result = await deleteMediaAsset(mediaId, companyId, { force });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("[MEDIA_ASSETS_DELETE_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete media asset" },
      { status: 400 }
    );
  }
}
