
// pages/api/faqs/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  

  if (req.method === 'GET') {
    try {
      const faq = await prisma.fAQ.findUnique({
        where: { id: String(id) },
      });
      if (!faq) {
        return res.status(404).json({ error: 'FAQ not found' });
      }
      res.status(200).json(faq);
    } catch (error) {
      console.error('Failed to fetch FAQ:', error);
      res.status(500).json({ error: 'Failed to fetch FAQ' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { question, answer } = req.body;
      const updatedFaq = await prisma.fAQ.update({
        where: { id: String(id) },
        data: {
          question,
          answer,
        },
      });
      res.status(200).json(updatedFaq);
    } catch (error) {
      console.error('Failed to update FAQ:', error);
      res.status(500).json({ error: 'Failed to update FAQ' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.fAQ.delete({
        where: { id: String(id) },
      });
      res.status(200).json({ message: 'FAQ deleted successfully' });
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      res.status(500).json({ error: 'Failed to delete FAQ' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
