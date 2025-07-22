import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

// Define the expected shape for updating a project member
interface ProjectMemberUpdateData {
  role?: string; // Role is optional for updates, assuming that's the primary field to update
  // Add other fields here if they can be updated via this route, e.g.,
  // projectId?: string;
  // userId?: string;
}

/**
 * Handles GET requests to retrieve a single project member by ID.
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} context The context object containing dynamic route parameters.
 * @param {Object} context.params The route parameters.
 * @param {string} context.params.id The ID of the project member.
 * @returns {NextResponse} The response containing the project member or an error.
 */
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ message: 'Project member ID is required.' }, { status: 400 });
    }

    const projectMember = await prisma.projectMember.findUnique({
      where: { id },
      include: {
        project: true,
        user: true,
      },
    });

    if (!projectMember) {
      return NextResponse.json({ message: 'Project member not found' }, { status: 404 });
    }

    return NextResponse.json(projectMember, { status: 200 });
  } catch (error) {
    console.error('Error fetching project member:', error);
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update an existing project member by ID.
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} context The context object containing dynamic route parameters.
 * @param {Object} context.params The route parameters.
 * @param {string} context.params.id The ID of the project member to update.
 * @returns {NextResponse} The response containing the updated project member or an error.
 */
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const { role }: ProjectMemberUpdateData = await request.json(); // Destructure only updatable fields

    if (!id) {
      return NextResponse.json({ message: 'Project member ID is required for update.' }, { status: 400 });
    }
    if (!role) { // Add validation for required update fields
      return NextResponse.json({ message: 'Role is required for update.' }, { status: 400 });
    }

    const updatedProjectMember = await prisma.projectMember.update({
      where: { id },
      data: {
        role,
        // updatedAt: new Date(), // Prisma automatically updates `updatedAt` on save if your schema uses `@updatedAt`
                               // but explicitly setting it here doesn't hurt if you don't have that
      },
    });

    return NextResponse.json(updatedProjectMember, { status: 200 });
  } catch (error: any) {
    console.error('Error updating project member:', error);
    if (error.code === 'P2025') {
      // P2025: An operation failed because it depends on one or more records that were required but not found.
      return NextResponse.json({ message: 'Project member not found', error: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a project member by ID.
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} context The context object containing dynamic route parameters.
 * @param {Object} context.params The route parameters.
 * @param {string} context.params.id The ID of the project member to delete.
 * @returns {NextResponse} The response indicating success or an error.
 */
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ message: 'Project member ID is required for deletion.' }, { status: 400 });
    }

    await prisma.projectMember.delete({
      where: { id },
    });

    // A 204 No Content response is standard for successful DELETE operations
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting project member:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Project member not found', error: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// Optionally, you can explicitly disallow other methods
export async function POST() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}