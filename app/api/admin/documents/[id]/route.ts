
// pages/api/documents/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const document = await prisma.document.findUnique({
        where: { id: String(id) },
      });
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.status(200).json(document);
    } catch (error) {
      console.error('Failed to fetch document:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  } else if (req.method === 'PUT') {
    try {
      const updatedDocument = await prisma.document.update({
        where: { id: String(id) },
        data: req.body,
      });
      res.status(200).json(updatedDocument);
    } catch (error) {
      console.error('Failed to update document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.document.delete({
        where: { id: String(id) },
      });
      res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Failed to delete document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
