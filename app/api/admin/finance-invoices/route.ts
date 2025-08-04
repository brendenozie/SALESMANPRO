// pages/api/invoices/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const invoices = await prisma.invoice.findMany({
        include: {
          client: {
            include: { user: { select: { name: true } } }
          },
        },
        orderBy: {
          issueDate: 'desc'
        }
      });
      res.status(200).json(invoices);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  } else if (req.method === 'POST') {
    try {
      const { clientId, invoiceNumber, amount, issueDate, dueDate, status, notes } = req.body;
      const newInvoice = await prisma.invoice.create({
        data: {
          clientId,
          invoiceNumber,
          amount: parseFloat(amount),
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          status,
          notes,
        },
      });
      res.status(201).json(newInvoice);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
