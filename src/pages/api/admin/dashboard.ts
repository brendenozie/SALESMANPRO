import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";
import { OrderStatus } from "@prisma/client";
import { getSession } from 'next-auth/react';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch required data in parallel

      const today = new Date();
      const startOfDay = new Date(today.toISOString().split('T')[0] + 'T00:00:00.000Z');

    const [
      newClients,
      lowStockInventory,
      topAgentData,
      communicationsToday,
      completedOrders,
      // salesData,
      tasks,
    ] = await Promise.all([
      // Number of new clients today
      prisma.client.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
          },
        },
      }),

      // Low-stock inventory items
      prisma.inventoryItem.count({
        where: {
          quantity: {
            lte: 5, // Customize threshold as needed
          },
        },
      }),

      // Top-performing agent and their sales
      prisma.salesAgent.findFirst({
        select: {
          name: true,
          orders: {
            select: {
              totalPrice: true,
            },
          },
        },
        orderBy: {
          orders: {
            _count: 'desc',
          },
        },
      }),

      // Number of communications today
      prisma.communication.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
          },
        },
      }),

      // Number of orders completed today
      prisma.order.count({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
          },
        },
      }),

      // Sales data for the day, month, etc.
      // prisma.$queryRaw`SELECT 
      //   SUM("totalPrice") as "todaySales",
      //   COUNT(CASE WHEN "status" = 'COMPLETED' THEN 1 END) as "leadsConverted"
      // FROM "Order" WHERE "createdAt" >= ${new Date(new Date().setHours(0, 0, 0, 0))}`,

      // Fetch tasks for the day
      // prisma.task.findMany({
      //   where: {
      //     dueDate: new Date().toISOString().split('T')[0], // Today
      //   },
      // }),

        prisma.task.findMany({
          where: {
            dueDate: startOfDay,
          },
        }),
    ]);

    // Aggregate and send data
    res.status(200).json({
      clientData: {
        newClients,
      },
      inventoryData: {
        lowStock: lowStockInventory,
      },
      agentData: {
        topAgent: topAgentData?.name || '',
        topAgentSales:
          topAgentData?.orders.reduce((sum: any, order: { totalPrice: any; }) => sum + order.totalPrice, 0) || 0,
      },
      communicationData: {
        today: communicationsToday,
      },
      orderData: {
        completedToday: completedOrders,
      },
      salesData: {
        todaySales: 10,//salesData[0]?.todaySales || 0,
        leadsConverted: 10,//salesData[0]?.leadsConverted || 0,
      },
      taskData: {
        tasks,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
