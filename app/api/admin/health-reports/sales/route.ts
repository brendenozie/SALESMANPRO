// app/api/admin/reports/sales/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const productId = searchParams.get("productId");
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      appointment: { // Filter by appointment details if relevant
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

    // Fetch OrderItems with related product, appointment, patient, and doctor data
    const orderItems = await prisma.orderItem.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id:true,
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
            user: { select: { name: true } }, // Patient
            doctor: { include: { User: { select: { name: true } } } }, // Doctor
          },
        },
        order: { // Include CustomerOrder details if available and relevant
          select: {
            id: true,
            consumerId:true,
            totalPrice: true,
            createdAt: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalSales = 0;
    let totalProfit = 0;
    const salesByProduct: { [key: string]: { name: string; quantity: number; revenue: number; profit: number } } = {};
    const salesByDoctor: { [key: string]: { name: string; revenue: number; appointments: number } } = {};
    const salesByPatient: { [key: string]: { name: string; totalSpent: number; orderCount: number } } = {};
    const dailySales: { [key: string]: number } = {}; // YYYY-MM-DD -> total revenue

    orderItems.forEach(item => {
      const revenue = item.quantity * item.price;
      const profit = item.product ? item.quantity * (item.product.sellingPrice - item.product.costPrice) : 0;

      totalSales += revenue;
      totalProfit += profit;

      // Aggregate sales by product
      if (item.product) {
        if (!salesByProduct[item.productId!]) {
          salesByProduct[item.productId!] = { name: item.product.name, quantity: 0, revenue: 0, profit: 0 };
        }
        salesByProduct[item.productId!].quantity += item.quantity;
        salesByProduct[item.productId!].revenue += revenue;
        salesByProduct[item.productId!].profit += profit;
      }

      // Aggregate sales by doctor (via appointment)
      if (item.appointment?.doctor?.User) {
        const doctorKey = item.appointment.doctor.id; // Use doctor's ID
        if (!salesByDoctor[doctorKey]) {
          salesByDoctor[doctorKey] = { name: item.appointment.doctor.User.name, revenue: 0, appointments: 0 };
        }
        salesByDoctor[doctorKey].revenue += revenue;
        // Only count appointment once per doctor, even if multiple items
        // This logic might need refinement based on how you define "appointments handled" for sales
        salesByDoctor[doctorKey].appointments += 1; // Simplistic: count each order item's appointment
      }

      // Aggregate sales by patient (via appointment)
      if (item.appointment?.user) {
        const patientKey = item.appointment.user.name; // Use patient's User ID
        if (!salesByPatient[patientKey]) {
          salesByPatient[patientKey] = { name: item.appointment.user.name, totalSpent: 0, orderCount: 0 };
        }
        salesByPatient[patientKey].totalSpent += revenue;
        salesByPatient[patientKey].orderCount += 1; // Count each order item
      }

      // Aggregate daily sales
      const itemDate = new Date(item.createdAt!).toISOString().split('T')[0];
      dailySales[itemDate] = (dailySales[itemDate] || 0) + revenue;
    });

    // Sort daily sales by date
    const sortedDailySales = Object.keys(dailySales)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => ({ date, revenue: dailySales[date] }));

    return NextResponse.json({
      totalSales: totalSales,
      totalProfit: totalProfit,
      salesByProduct: Object.values(salesByProduct),
      salesByDoctor: Object.values(salesByDoctor),
      salesByPatient: Object.values(salesByPatient),
      dailySales: sortedDailySales,
      rawOrderItems: orderItems.map(item => ({ // Optionally return raw data for detailed view
        id: item.id,
        productName: item.product?.name,
        quantity: item.quantity,
        price: item.price,
        revenue: item.quantity * item.price,
        patientName: item.appointment?.user?.name,
        doctorName: item.appointment?.doctor?.User?.name,
        appointmentDate: item.appointment?.date ? new Date(item.appointment.date).toISOString().split('T')[0] : 'N/A',
        orderDate: new Date(item.createdAt!).toISOString().split('T')[0],
      })),
    });
  } catch (err: any) {
    console.error("GET /api/admin/reports/sales error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
