import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from '@/lib/verifyAuth';

const prisma = new PrismaClient();

// =======================================================================
// GET: Fetch all documents
// =======================================================================
async function getDocuments(request: Request) {
  


  const documents = await prisma.document.findMany({
    include: {
      uploader: {
        select: { name: true, email: true },
      },
      company: {
        select: { name: true },
      },
    },
  });

  return formatResponse(true, { data: documents }, null, 200);
}

// =======================================================================
// POST: Create a new document
// =======================================================================
async function createDocument(request: Request) {
  


  const { name, fileUrl, mimeType, fileSize, uploaderId, companyId } = await request.json();

  if (!name || !fileUrl || !mimeType || !fileSize || !uploaderId || !companyId) {
    return formatResponse(false, null, 'Missing required fields', 400);
  }

  const newDocument = await prisma.document.create({
    data: {
      name,
      fileUrl,
      mimeType,
      fileSize,
      uploaderId,
      companyId,
    },
  });

  return formatResponse(true, { data: newDocument }, null, 201);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDocuments);
export const POST = withApiHandler(createDocument);
