// app/api/admin/[adminSlug]/trainers/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import bcrypt from 'bcryptjs';

// Helper function to generate a unique 6-digit login code
async function generateUniqueLoginCode(): Promise<string> {
  let code: string = '';
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    code = code.padStart(6, '0'); // Ensure it's 6 digits, e.g., '001234'

    const existingEducator = await prisma.educator.findUnique({
      where: { loginCode: code },
    });

    if (!existingEducator) {
      isUnique = true;
    }
  }
  return code;
}

// GET /api/admin/[adminSlug]/trainers
// Fetches all trainers (Educators) for a specific company.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const skip = (page - 1) * perPage;

    // Filter parameters
    const companyId = searchParams.get('companyId');

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const trainers = await prisma.educator.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        user: { // Include the related User model to get name, email, phone
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map Prisma Educator model to a frontend-friendly interface
    const formattedTrainers = trainers.map(trainer => ({
      id: trainer.id,
      userId: trainer.userId,
      name: trainer.user?.name || 'N/A',
      email: trainer.user?.email || 'N/A',
      phone: trainer.user?.phone || 'N/A',
      specialty: trainer.specialty || 'General Fitness',
      bio: trainer.bio || 'No bio available.',
      certifications: trainer.certifications || [],
      photoUrl: trainer.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
      status: trainer.status,
    }));

    return NextResponse.json(formattedTrainers);
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return NextResponse.json({ message: 'Failed to fetch trainers', error: "error.message" }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/trainers
// Creates a new trainer (including a new user with EDUCATOR role).
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const skip = (page - 1) * perPage;

    // Filter parameters
    const companyId = searchParams.get('companyId');

  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      specialty,
      bio,
      certifications, // Array of strings
      photoUrl,
      status,
    } = body;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    // const companyId = company.id;

    // Basic validation
    if (!name || !email || !password || !specialty) {
      return NextResponse.json({ message: 'Name, email, password, and specialty are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a Prisma transaction to ensure atomicity for creating User and Educator
    const newTrainerData = await prisma.$transaction(async (tx) => {
      // Create the new User with EDUCATOR role
      const newUser = await tx.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
          phone: phone || null,
          role: 'EDUCATOR', // Assign the EDUCATOR role
          status: 'ACTIVE', // Default status for new users
          company: {
            connect: { id: companyId },
          },
        },
      });

      const loginCode = await generateUniqueLoginCode();

      // Create the Educator profile linked to the new User
      const newEducator = await tx.educator.create({
        data: {
          userId: newUser.id,
          companyId: companyId,
          loginCode: loginCode,
          specialty: specialty,
          bio: bio || null,
          certifications: certifications || [],
          photoUrl: photoUrl || null,
          status: status || 'ACTIVE', // Default status for new educator profile
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
      return newEducator;
    });

    // Format the new trainer data for frontend display
    const formattedNewTrainer = {
      id: newTrainerData.id,
      userId: newTrainerData.userId,
      name: newTrainerData.user?.name || 'N/A',
      email: newTrainerData.user?.email || 'N/A',
      phone: newTrainerData.user?.phone || 'N/A',
      specialty: newTrainerData.specialty || 'General Fitness',
      bio: newTrainerData.bio || 'No bio available.',
      certifications: newTrainerData.certifications || [],
      photoUrl: newTrainerData.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
      status: newTrainerData.status,
    };

    return NextResponse.json(formattedNewTrainer, { status: 201 });
  } catch (error) {
    console.error('Error creating trainer:', error);
    // if (error.code === 'P2002') { // Unique constraint violation (e.g., email already exists)
    //   return NextResponse.json({ message: 'A user with this email already exists.', error: error.message }, { status: 409 });
    // }
    return NextResponse.json({ message: 'Failed to create trainer', error: "error.message" }, { status: 500 });
  }
}
