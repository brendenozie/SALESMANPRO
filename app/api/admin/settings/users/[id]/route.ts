

// pages/api/settings/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { name, email, role, status } = req.body;
      const updatedUser = await prisma.user.update({
        where: { id: String(id) },
        data: { name, email, role, status },
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({
        where: { id: String(id) },
      });
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Failed to delete user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}