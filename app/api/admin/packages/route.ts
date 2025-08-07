// pages/api/packages/index.ts
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
     
      const packages = await prisma.package.findMany({
        where:{companyId},
        orderBy: {
          createdAt: 'desc'
        }
      });
      // res.status(200).json(packages);
      
      return NextResponse.json({packages},{ status: 200 });
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
  
  // const { searchParams } = new URL(request.url);
  // const companyId = searchParams.get('companyId');


  try {
    const body = await request.json();
        
    const { title, price, frequency, features, status, isFeatured, companyId } = body;

    const newPackage = await prisma.package.create({
      data: {
        title,
        price,
        frequency,
        features,
        status,
        isFeatured,
        companyId
      },
    });

    // res.status(201).json(newPackage);

      // res.status(201).json({ ...newClient, user: newUser });
      return NextResponse.json(
            // { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { newPackage },
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

