import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../server/db/prismadb";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: 405, message: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body.data;

    if (!email || !password) {
      return res.status(400).json({ status: 400, message: "Missing login details" });
    }

    const userTypes: { model: { findUnique: (args: any) => Promise<any> }, role: string }[] = [
      { model: prisma.consumer, role: "CONSUMER" },
      { model: prisma.salesAgent, role: "SALES_AGENT" },
      { model: prisma.client, role: "CLIENT" },
      { model: prisma.user, role: "ADMIN" },
    ];

    let user = null;
    let userRole = null;

    for (const type of userTypes) {
      user = await type.model.findUnique({ where: { email } });
      if (user) {
        userRole = type.role;
        break;
      }
    }

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "This account does not exist. Please register first.",
      });
    }

    // Verify password
    // const passwordValid = await bcrypt.compare(password, user.password);
    // if (!passwordValid) {
    //   return res.status(401).json({ status: 401, message: "Invalid credentials" });
    // }

    // Omit password from response
    const { password: _pw, ...safeUser } = user;

    return res.status(200).json({
      status: 200,
      message: "Login successful",
      body: {
        ...safeUser,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
