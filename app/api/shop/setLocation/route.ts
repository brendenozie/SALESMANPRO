import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Method Not Allowed" });
  }

  try {
    const { userId, latitude, longitude, address, description } = req.body;

    if (!userId || !latitude || !longitude || !address) {
      return NextResponse.json({ message: "All fields are required" });
    }

    // Upsert location for the user
    const location = await prisma.location.upsert({
      where: { userId },
      update: { latitude, longitude, address, description },
      create: { userId, latitude, longitude, address, description },
    });

    res.status(200).json({ message: "Location updated", location });
  } catch (error) {
    console.error(error);
    NextResponse.json({ message: "Server Error" });
  }
}
