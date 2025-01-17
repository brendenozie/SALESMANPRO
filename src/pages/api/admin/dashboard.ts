import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // const companyId = session.user.companyId;

    // Fetch new clients count
    const newClients = await prisma.client.count({
      where: {
        // companyId: companyId,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    // Fetch low stock items
    const lowStock = await prisma.inventoryItem.count({
      where: {
        // companyId: companyId,
        quantity: { lte: 10 }, // Example threshold
      },
    });

    // Fetch top agent data
    const topAgent = await prisma.salesAgent.findFirst({
      // where: { companyId: companyId },
      orderBy: {
        orders: {
          _count: 'desc',
        },
      },
      select: { id: true, name: true, orders: true },
    });

    const topAgentSales = await prisma.order.aggregate({
      where: {
        salesAgentId: topAgent?.id,
        // companyId: companyId,
        status: 'COMPLETED',
      },
      _sum: { totalPrice: true },
    });

    // Fetch today's communications
    const todayCommunications = await prisma.communication.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    // Fetch completed orders today
    const completedToday = await prisma.order.count({
      where: {
        // companyId: companyId,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    // Optional Sales Data
    const todaySales = await prisma.order.aggregate({
      where: {
        // companyId: companyId,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      _sum: { totalPrice: true },
    });

    const monthlyTargetProgress = await prisma.target.aggregate({
      where: {
        // companyId: companyId,
        status: 'ONGOING',
      },
      _avg: { achievedValue: true },
    });

    const leadsConverted = await prisma.client.count({
      // where: { companyId: companyId },
    });

    const demosConducted = await prisma.task.count({
      where: {
        taskName: 'Demo',
        // user: { companyId: companyId },
      },
    });

    const commissionEarned = await prisma.commission.aggregate({
      where: {
        // companyId: companyId,
        status: 'COMPLETED',
      },
      _sum: { commissionEarned: true },
    });

    // Task Data
    const tasks = await prisma.task.findMany({
      // where: { user: { companyId: companyId } },
      select: { id: true, taskName: true, dueDate: true, dueTime: true },
    });

    const response = {
      clientData: { newClients },
      inventoryData: { lowStock },
      agentData: { topAgent: topAgent?.name, topAgentSales: topAgentSales._sum.totalPrice || 0 },
      communicationData: { today: todayCommunications },
      orderData: { completedToday },
      salesData: {
        todaySales: todaySales._sum.totalPrice || 0,
        monthlyTargetProgress: monthlyTargetProgress._avg.achievedValue || 0,
        leadsConverted,
        demosConducted,
        commissionEarned: commissionEarned._sum.commissionEarned || 0,
      },
      taskData: { tasks },
      session,
    };

    console.log(response);

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
