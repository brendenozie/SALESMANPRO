// app/api/admin/[adminSlug]/experts/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import bcrypt from 'bcryptjs';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/admin/[adminSlug]/experts
// Fetches all experts for a specific company.
export async function GET(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { adminSlug } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const experts = await prisma.expert.findMany({
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

    // Map Prisma Expert model to a frontend-friendly interface
    const formattedExperts = experts.map(expert => ({
      id: expert.id,
      userId: expert.userId, // Keep userId for potential future use (e.g., linking to user profile)
      name: expert.user?.name || 'N/A',
      email: expert.user?.email || 'N/A',
      phone: expert.user?.phone || 'N/A',
      specialty: expert.specialty,
      experienceYears: expert.experienceYears,
      travelsCompleted: expert.travelsCompleted,
      photoUrl: expert.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
      bio: expert.bio || '',
      contactEmail: expert.contactEmail || '',
      contactPhone: expert.contactPhone || '',
      status: expert.status,
    }));

    return NextResponse.json(formattedExperts);
  } catch (error) {
    console.error('Error fetching experts:', error);
    return NextResponse.json({ message: 'Failed to fetch experts', error: error.message }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/experts
// Creates a new expert (including a new user with EXPERT role).
export async function POST(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { adminSlug } = params;

  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      specialty,
      experienceYears,
      travelsCompleted,
      photoUrl,
      bio,
      contactEmail,
      contactPhone,
      status,
    } = body;

    // 1. Find the company ID based on the adminSlug
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const companyId = company.id;

    // 2. Basic validation
    if (!name || !email || !password || !specialty || experienceYears === undefined || travelsCompleted === undefined) {
      return NextResponse.json({ message: 'Missing required fields for expert creation.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // 3. Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a Prisma transaction to ensure atomicity for creating User and Expert
    const newExpertData = await prisma.$transaction(async (tx) => {
      // 5. Create the new User with EXPERT role
      const newUser = await tx.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
          phone: phone || null,
          role: 'EXPERT', // Assign the EXPERT role
          status: 'ACTIVE', // Default status for new users
          company: {
            connect: { id: companyId },
          },
        },
      });

      // 6. Create the Expert profile linked to the new User
      const newExpert = await tx.expert.create({
        data: {
          userId: newUser.id,
          companyId: companyId,
          specialty: specialty,
          experienceYears: parseInt(experienceYears),
          travelsCompleted: parseInt(travelsCompleted),
          photoUrl: photoUrl || null,
          bio: bio || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          status: status || 'ACTIVE', // Default status for new expert profile
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
      return newExpert;
    });

    // 7. Format the new expert data for frontend display
    const formattedNewExpert = {
      id: newExpertData.id,
      userId: newExpertData.userId,
      name: newExpertData.user?.name || 'N/A',
      email: newExpertData.user?.email || 'N/A',
      phone: newExpertData.user?.phone || 'N/A',
      specialty: newExpertData.specialty,
      experienceYears: newExpertData.experienceYears,
      travelsCompleted: newExpertData.travelsCompleted,
      photoUrl: newExpertData.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
      bio: newExpertData.bio || '',
      contactEmail: newExpertData.contactEmail || '',
      contactPhone: newExpertData.contactPhone || '',
      status: newExpertData.status,
    };

    return NextResponse.json(formattedNewExpert, { status: 201 });
  } catch (error) {
    console.error('Error creating expert:', error);
    if (error.code === 'P2002') { // Unique constraint violation (e.g., email already exists)
      return NextResponse.json({ message: 'An expert with this email already exists.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create expert', error: error.message }, { status: 500 });
  }
}
