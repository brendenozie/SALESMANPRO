import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";

// ============================================================================
// CONSTANTS & OPTIMIZATIONS
// ============================================================================

/**
 * OPTIMIZATION: Constant selection object for database queries.
 * Uses `select` instead of `include` to fetch only required fields.
 */
const TARGET_SELECT = {
  id: true,
  targetValue: true,
  achievedValue: true,
  status: true,
  startDate: true,
  endDate: true,
  periodStart: true,
  periodEnd: true,
  isAchieved: true,
  targetType: true,
  metricType: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  // Nested relations with selective fields
  salesAgent: {
    select: {
      id: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  },
  product: {
    select: {
      id: true,
      name: true,
    },
  },
};

/**
 * Flattens nested Prisma results into a clean, flat structure for the frontend.
 * Transforms:
 *   - salesAgent.user.name → agentName
 *   - product.name → productName
 * This prevents the frontend from dealing with nested objects.
 */
const flattenTarget = (target: any) => ({
  id: target.id,
  targetValue: target.targetValue,
  achievedValue: target.achievedValue,
  status: target.status,
  startDate: target.startDate,
  endDate: target.endDate,
  periodStart: target.periodStart,
  periodEnd: target.periodEnd,
  isAchieved: target.isAchieved,
  targetType: target.targetType,
  metricType: target.metricType,
  notes: target.notes,
  createdAt: target.createdAt,
  updatedAt: target.updatedAt,
  // Flattened fields
  agentId: target.salesAgent?.id || null,
  agentName: target.salesAgent?.user?.name || "N/A",
  productId: target.product?.id || null,
  productName: target.product?.name || "N/A",
  // Keep nested structure for backward compatibility with frontend
  salesAgent: {
    name: target.salesAgent?.user?.name || "N/A",
  },
  product: {
    name: target.product?.name || "N/A",
  },
});

// ============================================================================
// GET HANDLER - Cache-First Pattern with Edge Caching
// ============================================================================

/**
 * GET /api/admin/targets
 * 
 * OPTIMIZATIONS:
 * 1. Cache-First: Checks Redis before hitting the database
 * 2. Selective Fields: Uses `select` to fetch only required fields
 * 3. Flat Response: Returns flattened data structure
 * 4. Edge Caching: Includes Cache-Control headers
 */
async function handleGET(request: Request) {
  const CACHE_KEY = "admin:targets:all";
  const CACHE_TTL = 60; // 60 seconds

  try {
    // STEP 1: Check cache first (Cache-First Pattern)
    const cachedTargets = await cacheGet<any[]>(CACHE_KEY);
    
    if (cachedTargets) {
      // Cache hit - return cached data with edge caching headers
      const response = formatResponse(true, cachedTargets);
      response.headers.set(
        "Cache-Control",
        "s-maxage=60, stale-while-revalidate=30"
      );
      return response;
    }

    // STEP 2: Cache miss - query database with optimized select
    const targets = await prisma.target.findMany({
      select: TARGET_SELECT,
      orderBy: { createdAt: "desc" },
    });

    // STEP 3: Flatten the response structure
    const flattenedTargets = targets.map(flattenTarget);

    // STEP 4: Update cache for future requests
    await cacheSet(CACHE_KEY, flattenedTargets, CACHE_TTL);

    // STEP 5: Return response with edge caching headers
    const response = formatResponse(true, flattenedTargets);
    response.headers.set(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=30"
    );
    
    return response;
  } catch (error: any) {
    console.error("Error fetching targets:", error);
    return formatResponse(false, null, "Failed to fetch targets", 500);
  }
}

// Export the handler wrapped with withApiHandler
export const GET = withApiHandler(handleGET);

// ============================================================================
// POST HANDLER - Atomic Operations with Cache Invalidation
// ============================================================================

/**
 * POST /api/admin/targets
 * 
 * OPTIMIZATIONS:
 * 1. Input Validation: Validates all required fields upfront
 * 2. Atomic Operations: Uses Prisma's atomic create within try/catch
 * 3. Selective Return: Returns only required fields using select
 * 4. Cache Invalidation: Invalidates all admin:targets:* cache keys
 * 5. Flat Response: Returns flattened data structure
 */
async function handlePOST(request: Request) {
  try {
    // STEP 1: Parse and validate input
    const {
      salesAgentId,
      productId,
      targetAmount,
      startDate,
      endDate,
    } = await request.json();

    if (
      !salesAgentId ||
      !productId ||
      targetAmount === undefined ||
      !startDate ||
      !endDate
    ) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    // STEP 2: Atomic database operation
    const newTarget = await prisma.target.create({
      data: {
        targetValue: targetAmount,
        periodStart: new Date(startDate),
        periodEnd: new Date(endDate),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        product: {
          connect: { id: productId },
        },
        salesAgent: {
          connect: { id: salesAgentId },
        },
      },
      // Use select to return only required fields
      select: TARGET_SELECT,
    });

    // STEP 3: Cache invalidation - invalidate all admin targets cache
    await cacheDel("admin:targets:*");

    // STEP 4: Return flattened response
    const flattenedTarget = flattenTarget(newTarget);
    
    return formatResponse(
      true,
      flattenedTarget,
      "Target created successfully",
      201
    );
  } catch (error: any) {
    console.error("Error creating target:", error);
    
    // Enhanced error handling for specific Prisma errors
    if (error.code === "P2002") {
      return formatResponse(
        false,
        null,
        "A target for this agent and product already exists",
        409
      );
    }
    
    return formatResponse(false, null, "Failed to create target", 500);
  }
}

// Export the handler wrapped with withApiHandler
export const POST = withApiHandler(handlePOST);

