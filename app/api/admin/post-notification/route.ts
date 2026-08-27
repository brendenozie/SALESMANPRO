import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { withApiHandler } from "@/lib/hooks/withApiHandler";


// POST /api/post
// Required fields in body: title
// Optional fields in body: content
async function handleGET( req : Request ) {
  if (req.method === 'POST') {
    // const { title, message, } = req.body;

    // try {
    //   const newNotification = await prisma.notification.create({
    //     data: { title, message },
    //   });
    //   res.status(201).json(newNotification);
    // } catch (error) {
    //   NextResponse.json({ error: 'Error creating notification' });
    // }
    return NextResponse.json({ message: 'POST request received' });
  }
  
  return NextResponse.json({ message: 'GET request received' });
}

export const GET = withApiHandler(handleGET);