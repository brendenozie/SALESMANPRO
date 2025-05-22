import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" });
  }

  const { userId, productId, action } = req.body;
  if (!userId || !productId || !action) {
    return NextResponse.json({ error: "Missing required fields" });
  }

  try {
    // Log the user action
    await prisma.userActivity.create({
      data: { userId, productId, action },
    });

    return res.status(200).json({ message: "User activity logged successfully" });
  } catch (error) {
    console.error("Error logging user activity:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}

