// pages/api/testimonials/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();


// GET /api/admin/[slug]/experts
// Fetches all experts for a specific company.
export async function GET(request: Request, res: NextApiResponse) {

    const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const status = searchParams.get('status');

  try {
   // Find all clients and include their associated user data
    //  const { status } = req.query;
      let testimonials;

      if (status) {
        testimonials = await prisma.testimonial.findMany({
          where: { 
            status: String(status), 
            companyId 
          },
          // include: {
          //   author: { select: { name: true, image: true } }
          // },
          orderBy: {
            createdAt: 'desc'
          }
        });
      } else {
        testimonials = await prisma.testimonial.findMany({
          where: { 
            companyId 
          },
          // include: {
          //   author: { select: { name: true, image: true } }
          // },
          orderBy: {
            createdAt: 'desc'
          }
        });
      }
      // res.status(200).json(testimonials);
      
      return NextResponse.json({testimonials},{ status: 200 });
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
    
    const { quote, authorId, authorName, authorTitle, status, companyId } = body;

    const newTestimonial = await prisma.testimonial.create({
      data: {
        quote,
        authorId,
        authorName,
        authorTitle,
        status,
        companyId
      },
    });
    // res.status(201).json(newTestimonial);

      // res.status(201).json({ ...newClient, user: newUser });
      return NextResponse.json(
            // { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { newTestimonial },
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

