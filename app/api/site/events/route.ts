import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return withCors({ error: 'Missing id parameter' }, 400);
  }

  try {
    const events = await prisma.event.findMany({
      where: { companyId: id },
      orderBy: { createdAt: 'desc' },
    });

    return withCors({ data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return withCors({ error: 'Failed to fetch events' }, 500);
  }
}
