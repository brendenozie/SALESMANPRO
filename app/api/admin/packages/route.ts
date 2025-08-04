// pages/api/packages/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const packages = await prisma.package.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      res.status(200).json(packages);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      res.status(500).json({ error: 'Failed to fetch packages' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, price, frequency, features, status, isFeatured } = req.body;
      const newPackage = await prisma.package.create({
        data: {
          title,
          price,
          frequency,
          features,
          status,
          isFeatured,
        },
      });
      res.status(201).json(newPackage);
    } catch (error) {
      console.error('Failed to create package:', error);
      res.status(500).json({ error: 'Failed to create package' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
