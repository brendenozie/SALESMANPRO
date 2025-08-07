// pages/api/clients/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();


// GET /api/admin/[slug]/experts
// Fetches all experts for a specific company.
export async function GET(request: Request, res: NextApiResponse) {

    const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  try {
   // Find all clients and include their associated user data
      const clients = await prisma.client.findMany({
        where: { companyId : companyId },
        include: {
          user: true, // Includes the related User model fields
          // company: true, // Includes the related Company model fields
        },
      });

      console.log(clients);
      
      return NextResponse.json({clients},{ status: 200 });
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      // res.status(500).json({ error: 'Failed to fetch clients' });
      return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
          );
    }
}

// POST /api/admin/[slug]/experts
// Creates a new expert (including a new user with EXPERT role).
export async function POST(request: Request, res: NextApiResponse) {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');


  try {
    const body = await request.json();
    const { name, email, phone, status } = body;

      // Create a new User first
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          status,
          // You may need to add other required fields from your User model here
          role: 'CLIENT', // Sets the default role
          password: 'default_password', // Consider a more robust password handling
        },
      });

      // Then create a new Client linked to the new User
      const newClient = await prisma.client.create({
        data: {
          userId: newUser.id,
          // Add companyId here if applicable, e.g., from a session
          companyId: companyId, // This is a placeholder, you'll need to get the companyId dynamically
          // Add other specific client fields from the request body if available
          inquiryCount: 0,
          dealStatus: 'LEAD',
          notes: '',
        },
      });

      // res.status(201).json({ ...newClient, user: newUser });
      return NextResponse.json(
            // { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { ...newClient, user: newUser },
            { status: 200 }
          );
    
    } catch (error) {
      console.error('Failed to create client:', error);
      // res.status(500).json({ error: 'Failed to create client' });
      return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
          );
    }
    }


