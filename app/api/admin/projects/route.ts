import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// Define the ProjectStatus type if not already defined globally or in a shared types file
export type ProjectStatus = 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';

// Define the expected shape for creating a new project
interface ProjectCreateData {
  name: string;
  description?: string | null;
  startDate?: string | null; // Expecting ISO string from client
  endDate?: string | null;   // Expecting ISO string from client
  status?: ProjectStatus;
  budget?: number | null;
  companyId?: string | null;
}

/**
 * Handles GET requests to retrieve all projects.
 * @param {Request} request The incoming Next.js request object.
 * @returns {NextResponse} The response containing all projects or an error.
 */
export async function GET(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const projects = await prisma.project.findMany({
      include: {
        tasks: true,
        events: true,
        donations: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new project.
 * @param {Request} request The incoming Next.js request object.
 * @returns {NextResponse} The response containing the newly created project or an error.
 */
export async function POST(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { name, description, startDate, endDate, status, budget, companyId }: ProjectCreateData = await request.json();

    // Basic validation: ensure 'name' is provided
    if (!name) {
      return NextResponse.json({ message: 'Project name is required.' }, { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined, // Convert ISO string to Date object
        endDate: endDate ? new Date(endDate) : undefined,     // Convert ISO string to Date object
        status,
        budget,
        companyId,
      },
    });

    return NextResponse.json(newProject, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error('Error creating project:', error);
    // Handle specific Prisma errors if necessary, e.g., unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A project with this name already exists.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// Optionally, explicitly disallow other methods
export async function PUT() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}