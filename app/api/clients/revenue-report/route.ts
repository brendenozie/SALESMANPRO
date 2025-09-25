import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
       const auth = await verifyAuth(req);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    if (req.method !== 'GET') {
        return NextResponse.json({ message: 'Only GET requests are allowed' });
    }

    const { reportType } = req.query;
    const { searchParams } = new URL(req.url);
  
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return NextResponse.json(
        { message: "Invalid pagination parameters." },
        { status: 400 }
      );
    }
  

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
        //         return NextResponse.json({ message: 'Invalid report type' });
        // }

        // res.status(200).json({ success: true, data });
    } catch (error) {
        console.error(error);
        NextResponse.json({ success: false, message: 'Internal server error' });
    }
}