import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from '@/server/db/prismadb';
import bcrypt from 'bcryptjs';
import { withApiHandler } from '@/lib/hooks/withApiHandler'; // New import
import { formatResponse } from '@/lib/formatResponse'; // New import
import { verifyAuth } from '@/lib/verifyAuth';

// Define the Expert type based on your Prisma schema
type Expert = {
  expertise: any[];
  id: string;
  userId: string | null;
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    phone?: string | null;
  } | null;
  companyId: string;
  specialty: string;
  experienceYears: number | null;
  travelsCompleted: number | null;
  photoUrl?: string | null;
  bio?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: string;
};

// Helper function to format the expert data for response
function formatExpertData(expert: Expert) {
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
    expertise: expert.expertise || [], // Include expertise field
  };
}

// =======================================================================
// GET /api/admin/[adminSlug]/experts
// Fetches all experts for a specific company.
// =======================================================================
async function getExperts(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  // Check if companyId exists
  if (!companyId) {
    return formatResponse(false, null, 'Missing companyId query parameter.', 400);
  }

  const cacheKey = `admin:experts:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
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

  const formattedExperts = experts.map(formatExpertData);

  try {
    if (company) {
      await cacheSet(cacheKey, formattedExperts, 60);
    }
  } catch (e) {}

  return formatResponse(true, formattedExperts, null, 200);
}


// =======================================================================
// POST /api/admin/[adminSlug]/experts
// Creates a new expert (including a new user with EXPERT role).
// =======================================================================
async function createExpert(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const body = await request.json();
  const {
    name, email, password, phone, specialty, experienceYears, travelsCompleted,
    photoUrl, bio, contactEmail, contactPhone, status, expertise,
  } = body;

  // Check if companyId exists
  if (!companyId) {
    return formatResponse(false, null, 'Missing companyId query parameter.', 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }

  // Validation
  if (!name || !email || !password || !specialty || experienceYears === undefined || travelsCompleted === undefined) {
    return formatResponse(false, null, 'Missing required fields for expert creation (name, email, password, specialty, experienceYears, travelsCompleted).', 400);
  }
  if (password.length < 8) {
    return formatResponse(false, null, 'Password must be at least 8 characters long.', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingUser) {
    return formatResponse(false, null, 'A user with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newExpertData = await prisma.$transaction(async (tx) => {
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
        staffProfile: {
          create: {
            companyId, jobTitle: "Expert", department: "Expertise", employmentStatus: "ACTIVE",
          },
        },
      },
    });

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
        expertise: expertise || [],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
    return newExpert;
  });

  const formattedNewExpert = formatExpertData(newExpertData);

  try { await cacheDel(`admin:experts:${companyId || 'global'}:*`); } catch (e) {}
  
  return formatResponse(true, formattedNewExpert, null, 201);
}

// Export the refactored handlers wrapped in withApiHandler
export const GET = withApiHandler(getExperts);
export const POST = withApiHandler(createExpert);
