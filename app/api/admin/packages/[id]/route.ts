
// pages/api/packages/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const pkg = await prisma.package.findUnique({
        where: { id: String(id) },
      });
      if (!pkg) {
        return res.status(404).json({ error: 'Package not found' });
      }
      res.status(200).json(pkg);
    } catch (error) {
      console.error('Failed to fetch package:', error);
      res.status(500).json({ error: 'Failed to fetch package' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, price, frequency, features, status, isFeatured } = req.body;
      const updatedPackage = await prisma.package.update({
        where: { id: String(id) },
        data: {
          title,
          price,
          frequency,
          features,
          status,
          isFeatured,
        },
      });
      res.status(200).json(updatedPackage);
    } catch (error) {
      console.error('Failed to update package:', error);
      res.status(500).json({ error: 'Failed to update package' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.package.delete({
        where: { id: String(id) },
      });
      res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
      console.error('Failed to delete package:', error);
      res.status(500).json({ error: 'Failed to delete package' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
