// app/api/clients/route.ts
import { PrismaClient } from '@prisma/client';
// 1. Incorporate the new imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse'; 

// Removed old imports:
// import { NextApiRequest, NextApiResponse } from 'next'; // Not standard for App Router
// import { formatResponse } from "@/lib/formatResponse";


const prisma = new PrismaClient();

// --- GET Handler Logic ---
// Note: We use the function wrapper to apply the HOF
const getClientsLogic = async (req: Request) => {
  // Access query parameters from the Request object
  
  const { searchParams } = new URL(req.url);
  
  const companyId = searchParams.get('companyId');

  // Find all clients and include their associated user data
  const clients = await prisma.client.findMany({
    where: { companyId: companyId || undefined },
    include: {
      user: true, // Includes the related User model fields
    },
  });

  // Use formatResponse to generate the final NextResponse
  // ASSUMPTION: formatResponse is modified to return a NextResponse/Response object
  return formatResponse(true, clients, 'Clients retrieved successfully', 200);
};

// Export the wrapped GET function
// ASSUMPTION: withApiHandler takes the logic function and returns a new route handler function (Request -> Response)
export const GET = withApiHandler(getClientsLogic);


// --- POST Handler Logic ---
const postClientLogic = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  
  const companyId = searchParams.get('companyId');

  const body = await req.json();
  const { name, email, phone, status, ...clientData } = body;

  // 1. Create a new User first
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      status,
      role: 'CLIENT',
      password: 'default_password', // WARN: Use a proper hashing mechanism
    },
  });

  // 2. Then create a new Client linked to the new User
  const newClient = await prisma.client.create({
    data: {
      userId: newUser.id,
      companyId: companyId,
      inquiryCount: 0,
      dealStatus: 'LEAD',
      notes: '',
      ...clientData,
    },
    include: {
      user: true,
    },
  });

  // Use formatResponse for success
  return formatResponse(true, newClient, 'Client created successfully', 201);
};

// Export the wrapped POST function
export const POST = withApiHandler(postClientLogic);