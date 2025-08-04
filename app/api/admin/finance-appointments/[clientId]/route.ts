
// pages/api/appointments/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const appointment = await prisma.financeAppointment.findUnique({
        where: { id: String(id) },
        include: { client: { include: { user: true } }, expert: true }
      });
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.status(200).json(appointment);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      res.status(500).json({ error: 'Failed to fetch appointment' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { date, notes, status } = req.body;
      const updatedAppointment = await prisma.financeAppointment.update({
        where: { id: String(id) },
        data: {
          date: date ? new Date(date) : undefined,
          notes,
          status,
        },
      });
      res.status(200).json(updatedAppointment);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.appointment.delete({
        where: { id: String(id) },
      });
      res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      res.status(500).json({ error: 'Failed to delete appointment' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
