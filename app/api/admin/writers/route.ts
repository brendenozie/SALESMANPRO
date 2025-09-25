// app/api/admin/writers/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { Prisma } from '@prisma/client';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/admin/writers - Get all writers
export async function GET(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const writers = await prisma.writer.findMany({
      where: companyId ? { companyId } : {},
      include: {
        user: true, // Include related User data
        company: true, // Include related Company data
      },
    });

    return NextResponse.json(writers, { status: 200 });
  } catch (error) {
    console.error('Error fetching writers:', error);
    return NextResponse.json({ message: 'Error fetching writers' }, { status: 500 });
  }
}

// POST /api/admin/writers - Create a new writer
export async function POST(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const body = await request.json();
    const { 
      name, 
      email, 
      role = 'WRITER', // Default role for a writer's associated user
      companyId, 
      phone, 
      bio, 
      address, 
      profilePicture, 
      // loginCode,
      totalArticles = 0, // Default value as per schema
      articlesThisMonth = 0, // Default value as per schema
      lastArticleDate, // Optional, can be null
      status = "Active" // Default value as per schema
    } = body;

    if (!email || !name || !companyId) {
      return NextResponse.json({ message: 'Missing required fields: email, name, loginCode, companyId' }, { status: 400 });
    }

    // Check if user with this email already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // If user exists, check if they already have a writer profile
      const existingWriter = await prisma.writer.findUnique({
        where: { userId: user.id },
      });
      if (existingWriter) {
        return NextResponse.json({ message: 'User with this email already exists as a writer.' }, { status: 409 });
      }
      // If user exists but no writer profile, connect to existing user
    } else {
      // Create a new user if not found
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: role //as Prisma.EnumValue<typeof Prisma.UserScalarFieldEnum, 'role'>, // Cast for enum type safety
        },
      });
    }

     let loginCode: string;

      let isUnique = false;
      do {
        // Generate a random 6-digit code
        loginCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Check if the code already exists
        const existingAgentWithCode = await prisma.writer.findUnique({
          where: { loginCode },
        });
        if (!existingAgentWithCode) {
          isUnique = true;
        }
      } while (!isUnique);

    // Create a new writer
    const newWriter = await prisma.writer.create({
      data: {
        userId: user.id,
        companyId: companyId,
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

    return NextResponse.json(newWriter, { status: 201 });
  } catch (error) {
    console.error('Error creating writer:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint violation (e.g., loginCode already exists or userId already has a writer)
      if (error.code === 'P2002') {
        if ((error.meta?.target as string[]).includes('loginCode')) {
          return NextResponse.json({ message: 'Login code already exists. Please use a different one.' }, { status: 409 });
        }
        if ((error.meta?.target as string[]).includes('userId')) {
          return NextResponse.json({ message: 'A writer profile already exists for this user.' }, { status: 409 });
        }
      }
    }
    return NextResponse.json({ message: 'Error creating writer' }, { status: 500 });
  }
}