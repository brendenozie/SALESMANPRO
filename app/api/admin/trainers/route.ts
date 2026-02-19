import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/[adminSlug]/trainers/route.ts
import prisma from '@/server/db/prismadb';
import bcrypt from 'bcryptjs';
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// Helper to generate unique 6-digit login codes
async function generateUniqueLoginCode(): Promise<string> {
  let code = '';
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    const existing = await prisma.educator.findUnique({ where: { loginCode: code } });
    if (!existing) isUnique = true;
  }
  return code;
}

// GET /api/admin/[adminSlug]/trainers
async function handleGET(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) return formatResponse(false, null, 'Company ID is required', 400);

  try {
    
    const cacheKey = `admin:trainers:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });

  try {
    if (company) {
      await cacheSet(cacheKey, company, 60);
    }
  } catch (e) {}
    if (!company) return formatResponse(false, null, 'Company not found', 404);

    const trainers = await prisma.educator.findMany({
      where: { companyId: company.id },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = trainers.map(trainer => ({
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

    try{ await cacheSet(cacheKey, formatted, 60); } catch (e) {}

    return formatResponse(true, formatted, "Fetched (Cached)", 200);
  } catch (error: any) {
    console.error('Error fetching trainers:', error);
    return formatResponse(false, null, error.message || 'Failed to fetch trainers', 500);
  }
}

// POST /api/admin/[adminSlug]/trainers
async function handlePOST(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) return formatResponse(false, null, 'Company ID is required', 400);

  try {
    const body = await request.json();
    const { name, email, password, phone, specialty, bio, certifications, photoUrl, status } = body;

    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
    if (!company) return formatResponse(false, null, 'Company not found', 404);

    if (!name || !email || !password || !specialty)
      return formatResponse(false, null, 'Name, email, password, and specialty are required', 400);
    if (password.length < 8) return formatResponse(false, null, 'Password must be at least 8 characters long', 400);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return formatResponse(false, null, 'A user with this email already exists', 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTrainer = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role: 'EDUCATOR',
          status: 'ACTIVE',
          company: { connect: { id: companyId } },
          staffProfile: { create: { 
            companyId,
            jobTitle: 'Trainer',
            department: 'Fitness',
            employmentStatus: 'ACTIVE',
           } },
        },
      });

      const loginCode = await generateUniqueLoginCode();

      const newEducator = await tx.educator.create({
        data: {
          userId: newUser.id,
          companyId,
          loginCode,
          specialty,
          bio: bio || null,
          certifications: certifications || [],
          photoUrl: photoUrl || null,
          status: status || 'ACTIVE',
        },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      });

      return newEducator;
    });

    const formatted = {
      id: newTrainer.id,
      userId: newTrainer.userId,
      name: newTrainer.user?.name || 'N/A',
      email: newTrainer.user?.email || 'N/A',
      phone: newTrainer.user?.phone || 'N/A',
      specialty: newTrainer.specialty || 'General Fitness',
      bio: newTrainer.bio || 'No bio available.',
      certifications: newTrainer.certifications || [],
      photoUrl: newTrainer.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
      status: newTrainer.status,
    };

    try{ await cacheSet(`admin:trainers:${companyId || 'global'}:*`, formatted, 60); } catch (e) {}
    return formatResponse(true, formatted, "Trainer created successfully", 201);
  } catch (error: any) {
    console.error('Error creating trainer:', error);
    return formatResponse(false, null, error.message || 'Failed to create trainer', 500);
  }
}

// Export with handlers wrapped
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
