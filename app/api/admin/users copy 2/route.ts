import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { UserStatus, Plan, ROLE } from '@prisma/client'; // Added ROLE enum import

// GET /api/users
// Fetches users with support for pagination, searching, and filtering.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const skip = (page - 1) * perPage;

    // Search and Filter parameters
    const searchTerm = searchParams.get('search')?.toLowerCase() || '';
    const filterStatus = searchParams.get('status') as UserStatus | null;
    const filterPlan = searchParams.get('plan') as Plan | null;
    const filterRole = searchParams.get('role') as ROLE | null; // Cast to ROLE enum

    // Construct the Prisma WHERE clause dynamically
    const where: any = {};

    // Check for companyId directly on the User model
    const companyId = searchParams.get('companyId');
    if (companyId) {
      where.companyId = companyId;
    }

    // Add search condition if a search term is provided
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Add status filter condition if provided
    if (filterStatus) {
      where.status = filterStatus;
    }

    // Add plan filter condition if provided
    if (filterPlan) {
      where.plan = filterPlan;
    }
    
    // Add role filter condition if provided
    if (filterRole) {
      where.role = filterRole;
    }

    // Fetch total count for pagination
    const totalItems = await prisma.user.count({ where });

    // Fetch users with pagination and filters
    const users = await prisma.user.findMany({
      skip,
      take: perPage,
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true, // Select plan
        status: true, // Select status
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalPages = Math.ceil(totalItems / perPage);

    return NextResponse.json({
      users,
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users', error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/users
// Handles creating a new user
export async function POST(request: Request) {
  try {
    const { companyId, ...userData } = await request.json();

    // Check if the request body is valid
    if (!userData || !userData.email || !companyId) {
      return NextResponse.json({ message: 'Invalid request body or missing companyId' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        ...userData,
        // Connect the user to a company
        company: {
          connect: {
            id: companyId,
          },
        },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    // The TypeError suggests a payload issue, so a more specific error message might be helpful
    if (error instanceof TypeError && (error as any).code === 'ERR_INVALID_ARG_TYPE') {
        return NextResponse.json({ message: 'Failed to create user. Invalid request body format.', error: (error as Error).message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create user', error: (error as Error).message }, { status: 500 });
  }
}

