import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function GET( req : Request ) {
  if (req.method === 'POST') {
    const { title, message, } = req.body;

    try {
      const newNotification = await prisma.notification.create({
        data: { title, message },
      });
      res.status(201).json(newNotification);
    } catch (error) {
      NextResponse.json({ error: 'Error creating notification' });
    }
  }
}