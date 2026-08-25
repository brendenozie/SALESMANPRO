import { NextRequest, NextResponse } from "next/server";

import prisma  from "@/server/db/prismadb";

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{
      jobId: string;
    }>;
  },
) {
  const { jobId } = await context.params;

  const job = await prisma.mediaJob.findUnique({
    where: {
      id: jobId,
    },
  });

  if (!job) {
    return NextResponse.json(
      {
        error: "Job not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    job,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { jobId: string } },
) {
  const job = await prisma.mediaJob.findUnique({
    where: { id: params.jobId },
    select: {
      id: true,
      status: true,
      progress: true,
      error: true,
      outputVersionId: true,
      // Pull the new URL if completed
      media: {
        select: {
          currentVersionId: true,
          url: true,
        },
      },
    },
  });

  if (!job)
    return NextResponse.json({ error: "Job not found" }, { status: 404 });

  return NextResponse.json({ job });
}
