
// pages/api/experts/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const expert = await prisma.expert.findUnique({
        where: { id: String(id) },
        include: { user: { select: { name: true, email: true, image: true } } }
      });
      if (!expert) {
        return res.status(404).json({ error: 'Expert not found' });
      }
      res.status(200).json(expert);
    } catch (error) {
      console.error('Failed to fetch expert:', error);
      res.status(500).json({ error: 'Failed to fetch expert' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, expertise, bio, image } = req.body;
      const updatedExpert = await prisma.expert.update({
        where: { id: String(id) },
        data: {
          title,
          expertise,
          bio,
          image,
        },
      });
      res.status(200).json(updatedExpert);
    } catch (error) {
      console.error('Failed to update expert:', error);
      res.status(500).json({ error: 'Failed to update expert' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.expert.delete({
        where: { id: String(id) },
      });
      res.status(200).json({ message: 'Expert deleted successfully' });
    } catch (error) {
      console.error('Failed to delete expert:', error);
      res.status(500).json({ error: 'Failed to delete expert' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
