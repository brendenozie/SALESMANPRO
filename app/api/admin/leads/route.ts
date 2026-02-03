import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function updateLead(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data,
  });

  return formatResponse(true, lead, "Updated", 200);
}

export const PUT = withApiHandler(updateLead);
