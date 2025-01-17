import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../server/db/prismadb";

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, message, } = req.body;

    try {
      const newNotification = await prisma.notification.create({
        data: { title, message },
      });
      res.status(201).json(newNotification);
    } catch (error) {
      res.status(500).json({ error: 'Error creating notification' });
    }
  }
}