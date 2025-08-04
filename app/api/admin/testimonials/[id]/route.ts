
// pages/api/testimonials/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const testimonial = await prisma.testimonial.findUnique({
        where: { id: String(id) },
        include: { author: { select: { name: true, image: true } } }
      });
      if (!testimonial) {
        return res.status(404).json({ error: 'Testimonial not found' });
      }
      res.status(200).json(testimonial);
    } catch (error) {
      console.error('Failed to fetch testimonial:', error);
      res.status(500).json({ error: 'Failed to fetch testimonial' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { quote, authorName, authorTitle, status } = req.body;
      const updatedTestimonial = await prisma.testimonial.update({
        where: { id: String(id) },
        data: {
          quote,
          authorName,
          authorTitle,
          status,
        },
      });
      res.status(200).json(updatedTestimonial);
    } catch (error) {
      console.error('Failed to update testimonial:', error);
      res.status(500).json({ error: 'Failed to update testimonial' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.testimonial.delete({
        where: { id: String(id) },
      });
      res.status(200).json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      res.status(500).json({ error: 'Failed to delete testimonial' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
