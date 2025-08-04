// app/api/admin/fees/route.ts

// Handles GET requests for all fee records
// pages/api/cases/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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
      res.status(200).json(cases);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      res.status(500).json({ error: 'Failed to fetch cases' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, clientId, assignedToUserId, caseType, status } = req.body;
      const newCase = await prisma.case.create({
        data: {
          title,
          description,
          clientId,
          assignedToUserId,
          caseType,
          status,
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
      res.status(201).json(newCase);
    } catch (error) {
      console.error('Failed to create case:', error);
      res.status(500).json({ error: 'Failed to create case' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}