// pages/api/faqs/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const faqs = await prisma.fAQ.findMany({
        orderBy: {
          createdAt: 'asc'
        }
      });
      res.status(200).json(faqs);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
  } else if (req.method === 'POST') {
    try {
      const { question, answer } = req.body;
      const newFaq = await prisma.fAQ.create({
        data: {
          question,
          answer,
        },
      });
      res.status(201).json(newFaq);
    } catch (error) {
      console.error('Failed to create FAQ:', error);
      res.status(500).json({ error: 'Failed to create FAQ' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
