// app/api/admin/fees/route.ts

// Handles GET requests for all fee records
// pages/api/cases/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
      const cases = await prisma.case.findMany({
        include: {
          client: {
            include: {
              user: true, // Include client's user data
            },
          },
          assignedTo: true, // Include assigned user data
        },
      });
      
      return NextResponse.json(cases, { status: 200 });
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      // res.status(500).json({ error: 'Failed to fetch cases' });
      return NextResponse.json(
        { message: 'Failed to create campaign', error: 'error.message || An unexpected error occurred.' },
        { status: 500 }
      );
    }
}

// POST a new campaign
export async function POST(request: Request) {
  try {

      const body = await request.json();
      const { title, description, clientId, assignedToUserId, caseType, status,companyId } = body;

      const newCase = await prisma.case.create({
        data: {
          title,
          description,
          clientId,
          assignedToUserId,
          caseType,
          status,
          companyId
          // Add other required fields from your Case model here
        },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          assignedTo: true,
        },
      });
      // res.status(201).json(newCase);
      return NextResponse.json(newCase, { status: 200 });
    } catch (error) {
      // console.error('Failed to create case:', error);
      // res.status(500).json({ error: 'Failed to create case' });
      return NextResponse.json(
        { message: 'Failed to create campaign', error: 'error.message || An unexpected error occurred.' },
        { status: 500 }
      );
    }
}

