// pages/api/campaigns/[id].js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // GET a single campaign by ID
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
          donations: true,
        },
      });
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      res.status(200).json(campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    // PUT (Update) an existing campaign by ID
    const { name, description, startDate, endDate, goalAmount, currentAmount, status } = req.body;
    try {
      const updatedCampaign = await prisma.campaign.update({
        where: { id },
        data: {
          name,
          description,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          goalAmount,
          currentAmount,
          status,
          updatedAt: new Date(), // Manually update updatedAt
        },
      });
      res.status(200).json(updatedCampaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // DELETE a campaign by ID
    try {
      await prisma.campaign.delete({
        where: { id },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
