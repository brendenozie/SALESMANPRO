// app/api/admin/writers/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from "@/server/db/prismadb";
import { Prisma } from '@prisma/client';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';


// GET /api/admin/writers/[id] - Get a single writer by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params;

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

    return NextResponse.json(writer, { status: 200 });
  } catch (error) {
    console.error('Error fetching writer:', error);
    return NextResponse.json({ message: 'Error fetching writer' }, { status: 500 });
  }
}

// PUT /api/admin/writers/[id] - Update a writer by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params;
    const body = await request.json();
    const { 
      name, 
      email, 
      role, // Role can be updated for the associated user
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
        where: { id: existingWriter.userId },
        data: {
          email,
          name,
          role: role //? (role as Prisma.EnumValue<typeof Prisma.UserScalarFieldEnum, 'role'>) : undefined,
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

    return NextResponse.json(updatedWriter, { status: 200 });
  } catch (error) {
    console.error('Error updating writer:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002' && (error.meta?.target as string[]).includes('loginCode')) {
        return NextResponse.json({ message: 'Login code already exists. Please use a different one.' }, { status: 409 });
      }
    }
    return NextResponse.json({ message: 'Error updating writer' }, { status: 500 });
  }
}

// DELETE /api/admin/writers/[id] - Delete a writer by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params;

    // First, find the writer to get the userId for potential user deletion
    const writerToDelete = await prisma.writer.findUnique({
      where: { id },
    });

    if (!writerToDelete) {
      return NextResponse.json({ message: 'Writer not found' }, { status: 404 });
    }

    // Delete the writer record
    await prisma.writer.delete({
      where: { id },
    });

    // Optional: Delete the associated User if this was their only associated record.
    // Consider your application's data integrity rules here.
    // If onDelete: Cascade is set on the User-Writer relation in Prisma schema,
    // deleting the Writer might automatically delete the User.
    // Otherwise, you might add logic here to check if the user has other relationships
    // before deciding to delete the user record.

    return NextResponse.json({ message: 'Writer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting writer:', error);
    return NextResponse.json({ message: 'Error deleting writer' }, { status: 500 });
  }
}