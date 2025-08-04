
// pages/api/cases/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const singleCase = await prisma.case.findUnique({
        where: { id: String(id) },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          assignedTo: true,
        },
      });
      if (!singleCase) {
        return res.status(404).json({ error: 'Case not found' });
      }
      res.status(200).json(singleCase);
    } catch (error) {
      console.error('Failed to fetch case:', error);
      res.status(500).json({ error: 'Failed to fetch case' });
    }
  } else if (req.method === 'PUT') {
    try {
      const updatedCase = await prisma.case.update({
        where: { id: String(id) },
        data: req.body,
        include: {
          client: {
            include: {
              user: true,
            },
          },
          assignedTo: true,
        },
      });
      res.status(200).json(updatedCase);
    } catch (error) {
      console.error('Failed to update case:', error);
      res.status(500).json({ error: 'Failed to update case' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.case.delete({
        where: { id: String(id) },
      });
      res.status(200).json({ message: 'Case deleted successfully' });
    } catch (error) {
      console.error('Failed to delete case:', error);
      res.status(500).json({ error: 'Failed to delete case' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}