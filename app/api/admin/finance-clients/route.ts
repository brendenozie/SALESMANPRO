// pages/api/clients/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Find all clients and include their associated user data
      const clients = await prisma.client.findMany({
        include: {
          user: true, // Includes the related User model fields
          company: true, // Includes the related Company model fields
        },
      });
      res.status(200).json(clients);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, phone, status } = req.body;

      // Create a new User first
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          status,
          // You may need to add other required fields from your User model here
          role: 'CLIENT', // Sets the default role
          password: 'default_password', // Consider a more robust password handling
        },
      });

      // Then create a new Client linked to the new User
      const newClient = await prisma.client.create({
        data: {
          userId: newUser.id,
          // Add companyId here if applicable, e.g., from a session
          companyId: req.body.companyId, // This is a placeholder, you'll need to get the companyId dynamically
          // Add other specific client fields from the request body if available
          inquiryCount: 0,
          dealStatus: 'LEAD',
          notes: '',
        },
      });

      res.status(201).json({ ...newClient, user: newUser });
    } catch (error) {
      console.error('Failed to create client:', error);
      res.status(500).json({ error: 'Failed to create client' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}