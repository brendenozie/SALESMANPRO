import { NextResponse } from "next/server";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


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
