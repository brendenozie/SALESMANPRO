import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Only GET requests are allowed' });
    }

    const { reportType } = req.query;

    try {
        // let data;

        // switch (reportType) {
        //     case 'total-revenue':
        //         data = await prisma.customerOrder.aggregate({
        //             _sum: { totalPrice: true },
        //         });
        //         break;

        //     case 'revenue-by-product':
        //         data = await prisma.customerOrder.groupBy({
        //             by: ['productId'],
        //             _sum: { totalPrice: true },
        //         });
        //         break;

        //     case 'revenue-by-sales-agent':
        //         data = await prisma.customerOrder.groupBy({
        //             by: ['clientId'],
        //             _sum: { totalPrice: true },
        //         });
        //         break;

        //     case 'revenue-by-client':
        //         data = await prisma.customerOrder.groupBy({
        //             by: ['clientId'],
        //             _sum: { totalPrice: true },
        //         });
        //         break;

        //     case 'revenue-by-company':
        //         data = await prisma.customerOrder.groupBy({
        //             by: ['clientId'],
        //             _sum: { totalPrice: true },
        //         });
        //         break;

        //     case 'monthly-revenue':
        //         data = await prisma.customerOrder.groupBy({
        //             by: ['createdAt'],
        //             _sum: { totalPrice: true },
        //             orderBy: { createdAt: 'asc' },
        //         });
        //         break;

        //     case 'revenue-vs-target':
        //         data = await prisma.target.aggregate({
        //             _sum: { targetValue: true },
        //         });
        //         const actualRevenue = await prisma.customerOrder.aggregate({
        //             _sum: { totalPrice: true },
        //         });
        //         data = {
        //             targetRevenue: data._sum.targetValue,
        //             actualRevenue: actualRevenue._sum.totalPrice,
        //             percentageAchieved: data._sum.targetValue ? ((actualRevenue._sum.totalPrice ?? 0) / data._sum.targetValue) * 100 : 0,
        //         };
        //         break;

        //     case 'commission-based-revenue':
        //         data = await prisma.commission.groupBy({
        //             by: ['salesAgentId'],
        //             _sum: { commissionEarned: true },
        //         });
        //         break;

        //     case 'product-category-revenue':
        //         data = await prisma.customerOrder.groupBy({
        //             by: ['productId'], // Assuming 'productId' is a valid field
        //             _sum: { totalPrice: true },
        //         });
        //         break;

        //     case 'revenue-by-order-status':
        //         data = await prisma.customerOrder.groupBy({
        //             by: ['status'],
        //             _sum: { totalPrice: true },
        //         });
        //         break;

        //     default:
        //         return res.status(400).json({ message: 'Invalid report type' });
        // }

        // res.status(200).json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}