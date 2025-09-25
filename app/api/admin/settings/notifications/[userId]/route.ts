
// pages/api/settings/notifications/[userId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const userSettings = await prisma.settings.findUnique({
        where: { userId: String(userId) },
      });
      res.status(200).json(userSettings);
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      res.status(500).json({ error: 'Failed to fetch user settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { newClientNotify, invoicePaidNotify } = req.body;
      const updatedSettings = await prisma.settings.upsert({
        where: { userId: String(userId) },
        update: { newClientNotify, invoicePaidNotify },
        create: { userId: String(userId), newClientNotify, invoicePaidNotify },
      });
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error('Failed to update user settings:', error);
      res.status(500).json({ error: 'Failed to update user settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
