// pages/api/stores/[id].ts

import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed

import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
    body,
  } = req;

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ensure the store belongs to the user
  const store = await prisma.company.findUnique({
    where: { id: String(id) },
  });
  if (!store || !session.user || store.userId !== session.user.id) {
    return res.status(404).json({ error: "Store not found" });
  }

  try {
    switch (method) {
      case "GET":
        return res.status(200).json(store);

      case "PUT":
      case "PATCH":
        // fields you allow updating
        const {
          name,
          slug,
          description,
          category,
          logoUrl,
          bannerUrl,
          contactEmail,
          contactPhone,
          address,
          socialLinks,
          policies,
          shippingZones,
        } = body;

        const updated = await prisma.company.update({
          where: { id: String(id) },
          data: {
            name,
            slug,
            description,
            category,
            logoUrl,
            bannerUrl,
            contactEmail,
            contactPhone,
            address,
            socialLinks,
            policies,
            // shippingZones,
          },
        });
        return res.status(200).json(updated);

      case "DELETE":
        await prisma.company.delete({
          where: { id: String(id) },
        });
        return res.status(204).end();


      default:
        res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
        return NextResponse.end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(`${method} /api/stores/[id] error:`, error);
    return NextResponse.json({ error: "Internal server error" });
  }
}
