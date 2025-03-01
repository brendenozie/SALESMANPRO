import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions} from "../../../auth/[...nextauth]"
import prisma from "@/server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, username, email, phone, bio, address, profilePicture } = req.body;

    // Update user in MongoDB via Prisma
    const updatedUser = await prisma.consumer.update({
      where: { email: session.user.email }, // Assuming email is unique
      data: { name, username, email, phone, bio, address, profilePicture },
    });

    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
