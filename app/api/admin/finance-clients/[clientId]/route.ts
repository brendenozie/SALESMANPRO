// pages/api/clients/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const client = await prisma.client.findUnique({
        where: { id: String(id) },
        include: {
          user: true,
        },
      });
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.status(200).json(client);
    } catch (error) {
      console.error('Failed to fetch client:', error);
      res.status(500).json({ error: 'Failed to fetch client' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, email, phone, status, ...clientData } = req.body;

      // Find the existing client to get the userId
      const existingClient = await prisma.client.findUnique({
        where: { id: String(id) },
      });

      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }

      // Update the related User model fields
      await prisma.user.update({
        where: { id: existingClient.userId },
        data: {
          name,
          email,
          phone,
          status,
        },
      });

      // Update the Client-specific fields
      const updatedClient = await prisma.client.update({
        where: { id: String(id) },
        data: clientData,
        include: {
          user: true,
        },
      });
      res.status(200).json(updatedClient);
    } catch (error) {
      console.error('Failed to update client:', error);
      res.status(500).json({ error: 'Failed to update client' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const existingClient = await prisma.client.findUnique({
        where: { id: String(id) },
      });

      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }

      // Delete the Client and its associated User record
      await prisma.client.delete({
        where: { id: String(id) },
      });
      await prisma.user.delete({
        where: { id: existingClient.userId },
      });

      res.status(200).json({ message: 'Client and user deleted successfully' });
    } catch (error) {
      console.error('Failed to delete client:', error);
      res.status(500).json({ error: 'Failed to delete client' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}