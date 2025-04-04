import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return await loginUser(req, res);
  }
  
  return res.status(405).json({ status: 405, message: "Method Not Allowed" });
}

async function loginUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.body.data;

    if (!email || !password) {
      return res.status(400).json({ status: 400, message: "Missing login details" });
    }

    // Find the user by email
    const user = await prisma.consumer.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        username: true,
        bio: true,
        address: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "This account does not exist. Create an account by registering.",
      });
    }

    // TODO: Implement password verification logic (e.g., bcrypt comparison)

    return res.status(200).json({
      status: 200,
      message: "Success",
      body: user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ status: 500, message: `Internal Server Error ${error}` });
  }
}
