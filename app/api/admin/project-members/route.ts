import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

// Define the expected shape for project member creation
interface ProjectMemberCreateData {
  projectId: string;
  userId: string;
  role: string; // Assuming 'role' is a string, adjust if it's an enum
}

/**
 * Handles GET requests to retrieve project members.
 * Can filter by projectId.
 * @param {Request} request The incoming Next.js request object.
 * @returns {NextResponse} The response containing project members or an error.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const projectMembers = await prisma.projectMember.findMany({
      where: projectId ? { projectId } : {},
      include: {
        project: true,
        user: true,
      },
    });

    return NextResponse.json(projectMembers, { status: 200 });
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new project member.
 * @param {Request} request The incoming Next.js request object.
 * @returns {NextResponse} The response containing the new project member or an error.
 */
export async function POST(request: Request) {
  try {
    const { projectId, userId, role }: ProjectMemberCreateData = await request.json();

    if (!projectId || !userId || !role) {
      return NextResponse.json({ message: 'Missing required fields: projectId, userId, and role are required.' }, { status: 400 });
    }

    const newProjectMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
    });

    return NextResponse.json(newProjectMember, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project member:', error);
    // Handle unique constraint violation (user already a member of this project)
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'User is already a member of this project.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// Optionally, you can explicitly disallow other methods
export async function PUT() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}