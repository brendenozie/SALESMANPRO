/**
 * app/api/site/[slug]/me/fitness/route.ts
 * 
 * GET /api/site/[slug]/me/fitness
 * Returns user's fitness programs, memberships, check-ins, and bookings.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { getUserFitness } from "@/lib/db";
import { mapToFitnessProgramDTO, FitnessListDTO } from "@/types/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get("status") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    // 1. Resolve company
    let companyId: string | undefined = undefined;
    if (slug) {
      const comp = await prisma.company.findFirst({
        where: { OR: [{ slug }, { id: /^[0-9a-fA-F]{24}$/.test(slug) ? slug : undefined }] },
        select: { id: true },
      });
      if (comp) companyId = comp.id;
    }

    // 2. Fetch consumer record
    const consumer = await prisma.consumer.findFirst({
      where: {
        userId,
        ...(companyId ? { companyId } : {}),
      },
      select: { id: true, membershipType: true, membershipStatus: true },
    });

    const [enrollments, memberships, checkIns, trainingPlans, bookings] = await Promise.all([
      getUserFitness(userId, slug, filters),
      consumer ? prisma.fitnessMembership.findMany({
        where: { consumerId: consumer.id },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      }) : [],
      consumer ? prisma.gymCheckIn.findMany({
        where: { consumerId: consumer.id },
        include: { location: { select: { name: true } } },
        orderBy: { checkInTime: "desc" },
        take: 10,
      }) : [],
      consumer ? prisma.fitnessTrainingPlan.findMany({
        where: { consumerId: consumer.id },
        include: { trainer: { select: { user: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      }) : [],
      consumer ? prisma.booking.findMany({
        where: { consumerId: consumer.id },
        include: { educator: { select: { user: { select: { name: true } } } } },
        orderBy: { startTime: "desc" },
        take: 10,
      }) : [],
    ]);
    
    const programDTOs = enrollments.map(mapToFitnessProgramDTO);
    
    const response: FitnessListDTO & {
      memberships?: any[];
      checkIns?: any[];
      trainingPlans?: any[];
      bookings?: any[];
      consumer?: any;
    } = {
      items: programDTOs,
      nextCursor: enrollments.length === filters.limit ? enrollments[enrollments.length - 1]?.id || null : null,
      total: programDTOs.length,
      memberships,
      checkIns,
      trainingPlans,
      bookings,
      consumer,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user fitness data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
