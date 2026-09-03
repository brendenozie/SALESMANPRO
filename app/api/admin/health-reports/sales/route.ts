import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


async function getSalesReport(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const productId = searchParams.get("productId");
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  // 1. Build Where Clause for OrderItems
  const whereClause: any = {
    // Orders are linked to appointments, which ensures they belong to the company
    appointment: {
      companyId: companyId,
    },
  };

  if (startDateParam) {
    whereClause.createdAt = { ...whereClause.createdAt, gte: new Date(startDateParam) };
  }
  if (endDateParam) {
    whereClause.createdAt = { ...whereClause.createdAt, lte: new Date(endDateParam) };
  }
  if (productId) {
    whereClause.productId = productId;
  }
  if (doctorId) {
    whereClause.appointment = { ...whereClause.appointment, doctorId: doctorId };
  }
  if (patientId) {
    whereClause.appointment = { ...whereClause.appointment, userId: patientId };
  }

  // 2. Fetch OrderItems with required related data
  
  const cacheKey = buildTenantCacheKey(companyId, "sales", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const orderItems = await prisma.orderItem.findMany({
    where: whereClause,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: true,
          sellingPrice: true,
          costPrice: true,
        },
      },
      appointment: {
        select: {
          id: true,
          date: true,
          service: true,
          user: { select: { id: true, name: true } }, // Patient User ID and Name
          doctor: { include: { User: { select: { id: true, name: true } } } }, // Doctor User ID and Name
        },
      },
      order: {
        select: {
          id: true,
          consumerId: true,
          totalPrice: true,
          createdAt: true,
          status: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // 3. Perform Aggregation
  let totalSales = 0;
  let totalProfit = 0;
  const salesByProduct: { [key: string]: { name: string; quantity: number; revenue: number; profit: number } } = {};
  const salesByDoctor: { [key: string]: { name: string; revenue: number; appointments: number } } = {};
  const salesByPatient: { [key: string]: { name: string; totalSpent: number; orderCount: number } } = {};
  const dailySales: { [key: string]: number } = {};

  orderItems.forEach(item => {
    const revenue = item.quantity * item.price;
    // Calculate profit using sellingPrice from OrderItem and costPrice from Product
    const profit = item.product ? item.quantity * (item.price - item.product.costPrice) : 0;

    totalSales += revenue;
    totalProfit += profit;

    // Aggregate sales by product
    if (item.productId && item.product) {
      const pKey = item.productId;
      if (!salesByProduct[pKey]) {
        salesByProduct[pKey] = { name: item.product.name, quantity: 0, revenue: 0, profit: 0 };
      }
      salesByProduct[pKey].quantity += item.quantity;
      salesByProduct[pKey].revenue += revenue;
      salesByProduct[pKey].profit += profit;
    }

    // Aggregate sales by doctor (via appointment)
    if (item.appointment?.doctor?.User?.id) {
      const dKey = String(item.appointment.doctor.User.id);
      const docName = item.appointment.doctor.User.name ?? "";
      if (!salesByDoctor[dKey]) {
        salesByDoctor[dKey] = { name: docName, revenue: 0, appointments: 0 };
      }
      salesByDoctor[dKey].revenue += revenue;
      // Note: This counts one 'sale' per order item per doctor, not unique appointments.
      salesByDoctor[dKey].appointments += 1;
    }

    // Aggregate sales by patient (via appointment)
    if (item.appointment?.user?.id) {
      const uKey = String(item.appointment.user.id);
      if (!salesByPatient[uKey]) {
        salesByPatient[uKey] = { name: item.appointment.user.name ?? "", totalSpent: 0, orderCount: 0 };
      }
      salesByPatient[uKey].totalSpent += revenue;
      salesByPatient[uKey].orderCount += 1;
    }

    // Aggregate daily sales
    const itemDate = new Date(item.createdAt!).toISOString().split('T')[0];
    dailySales[itemDate] = (dailySales[itemDate] || 0) + revenue;
  });

  // 4. Finalize Daily Sales Array
  const sortedDailySales = Object.keys(dailySales)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(date => ({ date, revenue: dailySales[date] }));

    try {
      if (orderItems) {
        await cacheSet(cacheKey, {
          totalSales, 
          totalProfit,
          salesByProduct: Object.values(salesByProduct),
          salesByDoctor: Object.values(salesByDoctor),
          salesByPatient: Object.values(salesByPatient),
          dailySales: sortedDailySales,
        }, 60);
      }
    } catch (e) {
      console.error("Error caching sales report:", e);
    }

  // 5. Return formatted success response
  return formatResponse(true, {
    totalSales: totalSales,
    totalProfit: totalProfit,
    salesByProduct: Object.values(salesByProduct),
    salesByDoctor: Object.values(salesByDoctor),
    salesByPatient: Object.values(salesByPatient),
    dailySales: sortedDailySales,
  }, "Sales report generated successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getSalesReport);
