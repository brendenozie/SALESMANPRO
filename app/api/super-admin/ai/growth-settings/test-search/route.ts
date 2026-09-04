import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { AIPlatformError } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();
    const provider = body.provider || "SERPAPI";
    const category = body.category || "Hardware";
    const location = body.location || "Nairobi";

    const startTime = Date.now();

    if (provider === "SERPAPI") {
      let serpApiKey = await superAdminAIService.getDecryptedApiKey("SERPAPI");
      if (!serpApiKey) serpApiKey = process.env.SERPAPI_API_KEY || null;

      if (!serpApiKey) {
        return NextResponse.json({
          success: false,
          error: "SerpApi key is not configured in database or environment.",
        }, { status: 400 });
      }

      const serpUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(`${category} in ${location} Kenya`)}&api_key=${serpApiKey}`;
      const resp = await fetch(serpUrl, { signal: AbortSignal.timeout(10000) });
      const latencyMs = Date.now() - startTime;

      if (!resp.ok) {
        return NextResponse.json({
          success: false,
          error: `SerpApi returned HTTP ${resp.status}: ${resp.statusText}`,
          latencyMs,
        }, { status: 400 });
      }

      const data = await resp.json();
      const results = (data.local_results || []).slice(0, 3).map((p: any) => ({
        businessName: p.title || "Unknown",
        address: p.address,
        phone: p.phone,
        rating: p.rating,
      }));

      return NextResponse.json({
        success: true,
        latencyMs,
        resultsCount: results.length,
        sampleResults: results,
      });
    } else if (provider === "GOOGLE_SEARCH") {
      const details = await superAdminAIService.getProviderDetails("GOOGLE_SEARCH");
      let googleApiKey = details.apiKey || process.env.GOOGLE_SEARCH_API_KEY;
      let engineId = details.metadata?.searchEngineId || process.env.GOOGLE_SEARCH_ENGINE_ID;

      if (!googleApiKey || !engineId) {
        return NextResponse.json({
          success: false,
          error: "Google Search API Key or Search Engine ID is missing.",
        }, { status: 400 });
      }

      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${engineId}&q=${encodeURIComponent(`${category} ${location} Kenya business`)}&num=3`;
      const resp = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
      const latencyMs = Date.now() - startTime;

      if (!resp.ok) {
        return NextResponse.json({
          success: false,
          error: `Google Search returned HTTP ${resp.status}: ${resp.statusText}`,
          latencyMs,
        }, { status: 400 });
      }

      const data = await resp.json();
      const results = (data.items || []).slice(0, 3).map((p: any) => ({
        businessName: p.title,
        link: p.link,
        snippet: p.snippet,
      }));

      return NextResponse.json({
        success: true,
        latencyMs,
        resultsCount: results.length,
        sampleResults: results,
      });
    }

    return NextResponse.json({ success: false, error: "Unsupported provider" }, { status: 400 });
  } catch (error: any) {
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
