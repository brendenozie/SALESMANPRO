import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

// Define the Project type based on your Prisma schema for better type safety
// This should ideally be imported from a shared types file if available
export type ProjectStatus = 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';

interface ProjectUpdateData {
  name?: string;
  description?: string | null;
  startDate?: string | null; // ISO string
  endDate?: string | null;   // ISO string
  status?: ProjectStatus;
  budget?: number | null;
  companyId?: string | null;
}

/**
 * Handles GET requests to retrieve a single project by ID.
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} context The context object containing dynamic route parameters.
 * @param {Object} context.params The route parameters.
 * @param {string} context.params.id The ID of the project.
 * @returns {NextResponse} The response containing the project or an error.
 */
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params; // Get the dynamic 'id' from the URL

    if (!id) {
      return NextResponse.json({ message: 'Project ID is required.' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
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

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update an existing project by ID.
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} context The context object containing dynamic route parameters.
 * @param {Object} context.params The route parameters.
 * @param {string} context.params.id The ID of the project to update.
 * @returns {NextResponse} The response containing the updated project or an error.
 */
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params; // Get the dynamic 'id'
    const { name, description, startDate, endDate, status, budget, companyId }: ProjectUpdateData = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Project ID is required for update.' }, { status: 400 });
    }

    // Prepare data for update, filtering out undefined values
    const dataToUpdate: Record<string, any> = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) dataToUpdate.status = status;
    if (budget !== undefined) dataToUpdate.budget = budget;
    if (companyId !== undefined) dataToUpdate.companyId = companyId;

    // Prisma automatically updates `updatedAt` if your schema uses `@updatedAt` on a DateTime field.
    // If not, you might need to add `updatedAt: new Date()` explicitly here.
    // dataToUpdate.updatedAt = new Date(); // Uncomment if you manage updatedAt manually

    const updatedProject = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error: any) {
    console.error('Error updating project:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ message: 'Project not found', error: error.message }, { status: 404 });
    }
    // Handle other potential Prisma errors like P2002 (Unique constraint violation)
    if (error.code === 'P2002') {
        return NextResponse.json({ message: 'A project with similar details already exists.', error: error.message }, { status: 409});
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a project by ID.
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} context The context object containing dynamic route parameters.
 * @param {Object} context.params The route parameters.
 * @param {string} context.params.id The ID of the project to delete.
 * @returns {NextResponse} The response indicating success or an error.
 */
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params; // Get the dynamic 'id'

    if (!id) {
      return NextResponse.json({ message: 'Project ID is required for deletion.' }, { status: 400 });
    }

    await prisma.project.delete({
      where: { id },
    });

    // 204 No Content response is standard for successful DELETE operations
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ message: 'Project not found', error: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// Explicitly disallow other HTTP methods if they are not intended for this route
export async function POST() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}