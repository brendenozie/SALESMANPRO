// app/api/admin/writers/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { Prisma } from '@prisma/client';
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse, verifyAuth } from "@/lib/verifyAuth";

// GET /api/admin/writers - Get all writers
export const GET = withApiHandler(async (request: Request) => {
const auth = await verifyAuth(request);
if (!auth.success) return formatResponse(false, null, auth.error, 401);

const { searchParams } = new URL(request.url);
const companyId = searchParams.get('companyId');

const writers = await prisma.writer.findMany({
where: companyId ? { companyId } : {},
include: {
user: true,
company: true,
},
});

return formatResponse(true, writers, "Writers fetched successfully", 200);
});

// POST /api/admin/writers - Create a new writer
export const POST = withApiHandler(async (request: Request) => {
const auth = await verifyAuth(request);
if (!auth.success) return formatResponse(false, null, auth.error, 401);

const body = await request.json();
const {
name,
email,
role = 'WRITER',
companyId,
phone,
bio,
address,
profilePicture,
totalArticles = 0,
articlesThisMonth = 0,
lastArticleDate,
status = "Active"
} = body;

if (!email || !name || !companyId) {
return formatResponse(false, null, 'Missing required fields: email, name, companyId', 400);
}

// Check if user exists
let user = await prisma.user.findUnique({
where: { email },
});

if (user) {
const existingWriter = await prisma.writer.findUnique({
where: { userId: user.id },
});
if (existingWriter) {
return formatResponse(false, null, 'User with this email already exists as a writer.', 409);
}
} else {
user = await prisma.user.create({
data: {
email,
name,
role,
},
});
}

// Generate unique loginCode
let loginCode: string;
let isUnique = false;
do {
loginCode = Math.floor(100000 + Math.random() * 900000).toString();
const existingWriterWithCode = await prisma.writer.findUnique({
where: { loginCode },
});
if (!existingWriterWithCode) {
isUnique = true;
}
} while (!isUnique);

// Create writer
const newWriter = await prisma.writer.create({
data: {
userId: user.id,
companyId,
phone,
bio,
address,
profilePicture,
loginCode,
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

return formatResponse(true, newWriter, "Writer created successfully", 201);
});
