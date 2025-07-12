// pages/api/donations/index.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // GET all donations
    try {
      const donations = await prisma.donation.findMany({
        include: {
          donor: true, // Include donor (User) details
          project: true, // Include project details
          campaign: true, // Include campaign details
        },
      });
      res.status(200).json(donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // POST a new donation
    const { donorId, amount, currency, paymentMethod, notes, status, projectId, campaignId, transactionId } = req.body;
    try {
      const newDonation = await prisma.donation.create({
        data: {
          donor: { connect: { id: donorId } },
          amount,
          currency,
          paymentMethod,
          notes,
          status,
          projectId: projectId || undefined, // Optional relation
          campaignId: campaignId || undefined, // Optional relation
          transactionId,
        },
      });
      // Optionally update campaign's currentAmount
      if (campaignId && status === 'SUCCESS') {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            currentAmount: {
              increment: amount,
            },
          },
        });
      }
      res.status(201).json(newDonation);
    } catch (error) {
      console.error('Error creating donation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
