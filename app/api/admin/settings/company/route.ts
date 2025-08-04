// pages/api/settings/company.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { companyId } = req.query;

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const companySettings = await prisma.company.findUnique({
        where: { id: String(companyId) },
        select: { name: true, contactEmail: true, contactPhone: true, address: true, logoUrl: true },
      });
      if (!companySettings) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.status(200).json(companySettings);
    } catch (error) {
      console.error('Failed to fetch company settings:', error);
      res.status(500).json({ error: 'Failed to fetch company settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, contactEmail, contactPhone, address } = req.body;
      const updatedSettings = await prisma.company.update({
        where: { id: String(companyId) },
        data: { name, contactEmail, contactPhone, address },
      });
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error('Failed to update company settings:', error);
      res.status(500).json({ error: 'Failed to update company settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
