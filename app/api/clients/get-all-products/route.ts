import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const products = await prisma.product.findMany({
        include: {
          productCategory: true,
          inventoryItems: {
            include: {
              AgentInventory: true,
            },
          },
          CommissionRate: true, // Include commission rate data
        },
      });

      const formattedProducts = products.map((product) => {
        const inventoryId = product.inventoryItems.map((item) => item.id);

        // Calculate company stock
        const companyStock = product.inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

        // Calculate agent stock
        const agentStock = product.inventoryItems.reduce((sum, item) => {
          const agentStockSum = item.AgentInventory.reduce((agentSum, agentItem) => agentSum + agentItem.quantity, 0);
          return sum + agentStockSum;
        }, 0);

        // Extract commission details
        const commissionRate = product.CommissionRate?.commissionRate || 0;
        const commissionType = product.CommissionRate?.commissionType || "COST";

        return {
          id: product.id,
          name: product.name,
          companyId: product.companyId,
          inventoryId: inventoryId,
          category: product.productCategory?.name || "Uncategorized",
          companyStock,
          agentStock,
          costPrice: product.costPrice,
          salesPrice: product.salesPrice,
          commissionRate,
          commissionType,
        };
      });

      return res.status(200).json(formattedProducts);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Internal server error" });
    }
  } else {
    return NextResponse.json({ message: "Method not allowed" });
  }
}


// 5. Fetch products sorted by proximity
// import clientPromise from '../../lib/mongodb';

// export default async function handler(req, res) {
//   if (req.method === 'GET') {
//     const { lat, lng } = req.query;
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
  
//     const db = (await clientPromise).db();
//     const products = await db.collection('Product')
//       .aggregate([
//         {
//           $geoNear: {
//             near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
//             distanceField: 'distance',
//             spherical: true,
//           },
//         },
//       ]).toArray();
//     res.status(200).json(products);
//   }
// }


// 5. Fetch products sorted by proximity
// import clientPromise from '../../lib/mongodb';

// export default async function handler(req, res) {
//   if (req.method === 'GET') {
//     const { lat, lng } = req.query;
//     const db = (await clientPromise).db();
//     const query = lat && lng
//       ? [
//           {
//             $geoNear: {
//               near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
//               distanceField: 'distance',
//               spherical: true,
//             },
//           },
//         ]
//       : [{ $sample: { size: 10 } }]; // Return random products if location is unavailable
    
//     const products = await db.collection('Product').aggregate(query).toArray();
//     res.status(200).json(products);
//   }
// }