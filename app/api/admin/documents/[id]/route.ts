import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from '@/lib/verifyAuth';

const prisma = new PrismaClient();

// Define the type for the dynamic segment 'id' from the URL
interface Params {
  params: { id: string };
}

// =======================================================================
// GET: Fetch a single document by ID
// =======================================================================
async function getDocument(request: Request, { params }: Params) {
  
  const { id } = params;
  
  const cacheKey = `admin:documents:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    return formatResponse(false, null, 'Document not found', 404);
  }

  try {
    if (document) {
      await cacheSet(cacheKey, { data: document }, 60);
    }
  } catch (e) {}


  return formatResponse(true, { data: document }, null, 200);
}

// =======================================================================
// PUT: Update an existing document by ID
// =======================================================================
async function updateDocument(request: Request, { params }: Params) {
  
  const { id } = params;
  const body = await request.json();

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: body,
  });

    try { await cacheDel(`admin:documents:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { data: updatedDocument }, null, 200);
}

// =======================================================================
// DELETE: Delete a document by ID
// =======================================================================
async function deleteDocument(request: Request, { params }: Params) {
  
  const { id } = params;

  await prisma.document.delete({
    where: { id },
  });

  // Clear cache for this document
    try { await cacheDel(`admin:documents:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { message: 'Document deleted successfully' }, null, 200);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDocument);
export const PUT = withApiHandler(updateDocument);
export const DELETE = withApiHandler(deleteDocument);
