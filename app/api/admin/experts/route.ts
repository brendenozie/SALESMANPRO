// pages/api/experts/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const experts = await prisma.expert.findMany({
        include: {
          user: {
            select: { name: true, email: true, image: true }
          },
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      res.status(200).json(experts);
    } catch (error) {
      console.error('Failed to fetch experts:', error);
      res.status(500).json({ error: 'Failed to fetch experts' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, title, expertise, bio, image } = req.body;
      const newExpert = await prisma.expert.create({
        data: {
          userId,
          title,
          expertise,
          bio,
          image,
        },
      });
      res.status(201).json(newExpert);
    } catch (error) {
      console.error('Failed to create expert:', error);
      res.status(500).json({ error: 'Failed to create expert' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
