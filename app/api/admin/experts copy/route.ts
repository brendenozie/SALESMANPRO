

import prisma from '@/server/db/prismadb';
import bcrypt from 'bcryptjs';
import { withApiHandler } from '@/lib/hooks/withApiHandler'; // New import
import { formatResponse } from '@/lib/formatResponse'; // New import
import { verifyAuth } from '@/lib/verifyAuth';

// Define the interface for the parameters object passed to the handler
interface Params {
  params: { adminSlug: string };
}

// Helper function to format the expert data for response
function formatExpertData(expert: any) {
  return {
    id: expert.id,
    userId: expert.userId,
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
    // Note: Assuming 'expertise' field might exist if previously added
    expertise: expert.expertise || [], 
  };
}

// =======================================================================
// GET /api/admin/[adminSlug]/experts
// Fetches all experts for a specific company identified by adminSlug.
// =======================================================================
async function getExperts(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { adminSlug } = params;

  // 1. Find the company ID based on the adminSlug
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found for the given slug.', 404);
  }

  const experts = await prisma.expert.findMany({
    where: {
      companyId: company.id,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Map Prisma Expert model to a frontend-friendly interface
  const formattedExperts = experts.map(formatExpertData);

  return formatResponse(true, { data: formattedExperts }, null, 200);
}

// =======================================================================
// POST /api/admin/[adminSlug]/experts
// Creates a new expert (including a new user with EXPERT role).
// =======================================================================
async function createExpert(request: Request, { params }: Params) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { adminSlug } = params;
  const body = await request.json();
  const {
    name, email, password, phone, specialty, experienceYears, travelsCompleted,
    photoUrl, bio, contactEmail, contactPhone, status, expertise, // Include expertise for POST body
  } = body;

  // 1. Find the company ID based on the adminSlug
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found for the given slug.', 404);
  }

  const companyId = company.id;

  // 2. Basic validation
  if (!name || !email || !password || !specialty || experienceYears === undefined || travelsCompleted === undefined) {
    return formatResponse(false, null, 'Missing required fields for expert creation.', 400);
  }
  if (password.length < 8) {
    return formatResponse(false, null, 'Password must be at least 8 characters long.', 400);
  }

  // 3. Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingUser) {
    return formatResponse(false, null, 'A user with this email already exists.', 409);
  }

  // Use a local try/catch for specific Prisma error codes, allowing withApiHandler to handle generic errors
  try {
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
          role: 'EXPERT',
          status: 'ACTIVE',
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
          status: status || 'ACTIVE',
          expertise: expertise || [], // Saving the new field
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });
      return newExpert;
    });

    // 7. Format the new expert data for frontend display
    const formattedNewExpert = formatExpertData(newExpertData);

    return formatResponse(true, { data: formattedNewExpert }, null, 201);
  } catch (error: any) {
    if (error.code === 'P2002') { // Unique constraint violation
      return formatResponse(false, null, 'An expert with this email already exists.', 409);
    }
    // Re-throw to be caught by withApiHandler for generic 500 handling
    throw error;
  }
}

// Export the refactored handlers wrapped in withApiHandler
export const GET = withApiHandler(getExperts);
export const POST = withApiHandler(createExpert);
