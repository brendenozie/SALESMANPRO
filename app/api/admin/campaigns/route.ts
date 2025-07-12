// pages/api/campaigns/index.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // GET all campaigns
    try {
      const campaigns = await prisma.campaign.findMany({
        include: {
          donations: true, // Include related donations
        },
      });
      res.status(200).json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // POST a new campaign
    const { name, description, startDate, endDate, goalAmount, currentAmount, status } = req.body;
    try {
      const newCampaign = await prisma.campaign.create({
        data: {
          name,
          description,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          goalAmount,
          currentAmount: currentAmount || 0, // Ensure default to 0 if not provided
          status,
        },
      });
      res.status(201).json(newCampaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
