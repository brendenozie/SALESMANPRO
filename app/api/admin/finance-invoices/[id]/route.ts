
// pages/api/invoices/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  if (req.method === 'GET') {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: String(id) },
        include: { client: { include: { user: true } } }
      });
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      res.status(200).json(invoice);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      res.status(500).json({ error: 'Failed to fetch invoice' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { clientId, invoiceNumber, amount, issueDate, dueDate, status, notes } = req.body;
      const updatedInvoice = await prisma.invoice.update({
        where: { id: String(id) },
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
      res.status(200).json(updatedInvoice);
    } catch (error) {
      console.error('Failed to update invoice:', error);
      res.status(500).json({ error: 'Failed to update invoice' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.invoice.delete({
        where: { id: String(id) },
      });
      res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      res.status(500).json({ error: 'Failed to delete invoice' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
