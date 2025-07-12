// pages/api/donations/[id].js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // GET a single donation by ID
    try {
      const donation = await prisma.donation.findUnique({
        where: { id },
        include: {
          donor: true,
          project: true,
          campaign: true,
        },
      });
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
      res.status(200).json(donation);
    } catch (error) {
      console.error('Error fetching donation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    // PUT (Update) an existing donation by ID
    const { amount, currency, paymentMethod, notes, status, projectId, campaignId, transactionId } = req.body;
    try {
      // Fetch old donation to correctly adjust campaign amount if status changes
      const oldDonation = await prisma.donation.findUnique({ where: { id } });
      if (!oldDonation) {
        return res.status(404).json({ message: 'Donation not found' });
      }

      const updatedDonation = await prisma.donation.update({
        where: { id },
        data: {
          amount,
          currency,
          paymentMethod,
          notes,
          status,
          projectId: projectId || undefined,
          campaignId: campaignId || undefined,
          transactionId,
          updatedAt: new Date(), // Manually update updatedAt
        },
      });

      // Logic to adjust campaign's currentAmount based on status change
      if (oldDonation.campaignId && oldDonation.status === 'SUCCESS' && updatedDonation.status !== 'SUCCESS') {
        await prisma.campaign.update({
          where: { id: oldDonation.campaignId },
          data: {
            currentAmount: {
              decrement: oldDonation.amount,
            },
          },
        });
      } else if (updatedDonation.campaignId && updatedDonation.status === 'SUCCESS' && oldDonation.status !== 'SUCCESS') {
        await prisma.campaign.update({
          where: { id: updatedDonation.campaignId },
          data: {
            currentAmount: {
              increment: updatedDonation.amount,
            },
          },
        });
      } else if (updatedDonation.campaignId && updatedDonation.status === 'SUCCESS' && oldDonation.status === 'SUCCESS' && oldDonation.amount !== updatedDonation.amount) {
        // If amount changes but status remains SUCCESS
        await prisma.campaign.update({
          where: { id: updatedDonation.campaignId },
          data: {
            currentAmount: {
              decrement: oldDonation.amount,
              increment: updatedDonation.amount,
            },
          },
        });
      }

      res.status(200).json(updatedDonation);
    } catch (error) {
      console.error('Error updating donation:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Donation not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // DELETE a donation by ID
    try {
      const deletedDonation = await prisma.donation.delete({
        where: { id },
      });
      // Optionally decrement campaign's currentAmount if the deleted donation was successful
      if (deletedDonation.campaignId && deletedDonation.status === 'SUCCESS') {
        await prisma.campaign.update({
          where: { id: deletedDonation.campaignId },
          data: {
            currentAmount: {
              decrement: deletedDonation.amount,
            },
          },
        });
      }
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting donation:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Donation not found' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
