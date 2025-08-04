// app/api/admin/fees/route.ts

// Handles GET requests for all fee records
// pages/api/cases/index.ts
// pages/api/documents/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const documents = await prisma.document.findMany({
        include: {
          uploader: {
            select: { name: true, email: true }, // Only include necessary user info
          },
          company: {
            select: { name: true }, // Only include company name
          },
        },
      });
      res.status(200).json(documents);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  } else if (req.method === 'POST') {
    try {
      // In a real application, you would handle file uploads here.
      // This is a placeholder for creating a new document in the database.
      // We will assume the frontend sends the necessary metadata.
      const { name, fileUrl, mimeType, fileSize, uploaderId, companyId } = req.body;
      const newDocument = await prisma.document.create({
        data: {
          name,
          fileUrl,
          mimeType,
          fileSize,
          uploaderId,
          companyId,
        },
      });
      res.status(201).json(newDocument);
    } catch (error) {
      console.error('Failed to create document:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
