
// pages/api/appointments/index.ts
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
      const appointments = await prisma.financeAppointment.findMany({
        where:{companyId:companyId},
        include: {
          client: {
            include: { user: { select: { name: true, email: true } } }
          },
          expert: {
            include: { user: {select: { name: true }}}
          }
        },
        orderBy: {
          date: 'asc'
        }
      });
      // res.status(200).json(appointments);
      console.log(appointments);
      return NextResponse.json({appointments},{ status: 200 });
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      // res.status(500).json({ error: 'Failed to fetch appointments' });
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
      const { clientId, expertId, date, notes, companyId } = body;
      const newAppointment = await prisma.financeAppointment.create({
        data: {
          clientId,
          expertId,
          date: new Date(date),
          notes,
          companyId
          // company: { connect: { id: companyId } },
        },
      });
      // res.status(201).json(newAppointment);
      return NextResponse.json(
            // { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            {newAppointment},
            { status: 200 }
          );
    } catch (error) {
      console.error('Failed to create appointment:', error);
      // res.status(500).json({ error: 'Failed to create appointment' });
      return NextResponse.json(
            { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
          );
    }
    
    }


