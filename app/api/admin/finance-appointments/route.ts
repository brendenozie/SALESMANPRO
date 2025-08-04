
// pages/api/appointments/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const appointments = await prisma.financeAppointment.findMany({
        include: {
          client: {
            include: { user: { select: { name: true, email: true } } }
          },
          expert: {
            select: { name: true }
          }
        },
        orderBy: {
          date: 'asc'
        }
      });
      res.status(200).json(appointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  } else if (req.method === 'POST') {
    try {
      const { clientId, expertId, date, notes } = req.body;
      const newAppointment = await prisma.financeAppointment.create({
        data: {
          clientId,
          expertId,
          date: new Date(date),
          notes,
        },
      });
      res.status(201).json(newAppointment);
    } catch (error) {
      console.error('Failed to create appointment:', error);
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
