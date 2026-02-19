import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/writers/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { Prisma } from '@prisma/client';
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET /api/admin/writers/[id] - Get a single writer by ID
export const GET = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {

const { id } = params;


    const cacheKey = `admin:writers:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const writer = await prisma.writer.findUnique({
where: { id },
include: {
user: true,
company: true,
},
});

if (!writer) {
return NextResponse.json({ message: 'Writer not found' }, { status: 404 });
}

    try { await cacheDel(`admin:writers:${'global' || 'global'}:*`); } catch (e) {
      console.error("Error deleting cached writers:", e);
    }
return NextResponse.json(writer, { status: 200 });
});

// PUT /api/admin/writers/[id] - Update a writer by ID
export const PUT = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {

const { id } = params;
const body = await request.json();
const {
name,
email,
role,
phone,
bio,
address,
profilePicture,
loginCode,
companyId,
totalArticles,
articlesThisMonth,
lastArticleDate,
status
} = body;

const existingWriter = await prisma.writer.findUnique({
where: { id },
include: { user: true },
});

if (!existingWriter) {
return NextResponse.json({ message: 'Writer not found' }, { status: 404 });
}

// Update User details if email, name, or role is provided
if (email || name || role) {
await prisma.user.update({
where: { id: existingWriter.userId || "" },
data: {
email,
name,
role,
},
});
}

// Update Writer details
const updatedWriter = await prisma.writer.update({
where: { id },
data: {
phone,
bio,
address,
profilePicture,
loginCode,
companyId,
totalArticles,
articlesThisMonth,
lastArticleDate: lastArticleDate ? new Date(lastArticleDate) : undefined,
status,
},
include: {
user: true,
company: true,
},
});


    try { await cacheDel(`admin:writers:${companyId || 'global'}:*`); } catch (e) {}
    return NextResponse.json(updatedWriter, { status: 200 });
});

// DELETE /api/admin/writers/[id] - Delete a writer by ID
export const DELETE = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {

const { id } = params;

const writerToDelete = await prisma.writer.findUnique({
where: { id },
});

if (!writerToDelete) {
return NextResponse.json({ message: 'Writer not found' }, { status: 404 });
}

await prisma.writer.delete({
where: { id },
});


    try { await cacheDel(`admin:writers:${'global' || 'global'}:*`); } catch (e) {}
    return NextResponse.json({ message: 'Writer deleted successfully' }, { status: 200 });
});
