// pages/api/testimonials/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status } = req.query;
      let testimonials;

      if (status) {
        testimonials = await prisma.testimonial.findMany({
          where: { status: String(status) },
          include: {
            author: { select: { name: true, image: true } }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      } else {
        testimonials = await prisma.testimonial.findMany({
          include: {
            author: { select: { name: true, image: true } }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      }
      res.status(200).json(testimonials);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
  } else if (req.method === 'POST') {
    try {
      const { quote, authorId, authorName, authorTitle, status } = req.body;
      const newTestimonial = await prisma.testimonial.create({
        data: {
          quote,
          authorId,
          authorName,
          authorTitle,
          status,
        },
      });
      res.status(201).json(newTestimonial);
    } catch (error) {
      console.error('Failed to create testimonial:', error);
      res.status(500).json({ error: 'Failed to create testimonial' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
