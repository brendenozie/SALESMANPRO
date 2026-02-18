import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

export const GET = withApiHandler(async (req, { user }) => {
  if (!user) {
    return formatResponse(false, "Unauthorized", "error", 401);
  }

  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");
  if (!companyId) {
    return formatResponse(false, "Missing companyId", "error", 400);
  }

  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);
  const status = searchParams.get("status")?.toUpperCase();

  const skip = (page - 1) * limit;

  const whereClause: any = { companyId };

  if (status) whereClause.status = status;

  if (user.role !== "ADMIN") {
    whereClause.patient = { doctorId: user.id };
  }

  // ✅ Run in parallel
  
    const cacheKey = `admin:invoices:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const [totalInvoiceItems, invoices] = await prisma.$transaction([
    prisma.patientInvoices.count({ where: whereClause }),
    prisma.patientInvoices.findMany({
      where: whereClause,
      take: limit,
      skip,
      orderBy: { invoiceDate: "desc" },
      select: {
        id: true,
        patientId: true,
        notes: true,
        amount: true,
        dueDate: true,
        status: true,
        invoiceDate: true,
        items: true,
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  try {
    if (totalInvoiceItems) {
      await cacheSet(cacheKey, totalInvoiceItems, 60);
    }
  } catch (e) {}

  const invoicesData = invoices.map((inv) => {
    const issued = inv.invoiceDate;

    return {
      id: inv.id,
      userId: inv.patientId,
      userName: inv.patient?.name ?? "N/A",
      userEmail: inv.patient?.email ?? "N/A",
      notes: inv.notes ?? "",
      amountDue: inv.amount,
      currency: "USD",
      dueDate: inv.dueDate?.toISOString() ?? "N/A",
      status:
        (inv.status.charAt(0) +
          inv.status.slice(1).toLowerCase()) as
          | "Paid"
          | "Unpaid"
          | "Overdue",
      downloadUrl: `${apiBaseUrl}/invoices/${companyId}/${inv.id}.pdf`,
      periodStart: new Date(
        issued.getTime() - 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      periodEnd: issued.toISOString(),
      issuedDate: issued.toISOString(),
      lineItems: inv.items as any,
    };
  });

  const totalInvoicePages = Math.ceil(totalInvoiceItems / limit);

  return formatResponse(
    true,
    {
      invoicesData,
      totalInvoiceItems,
      totalInvoicePages,
      page,
      limit,
    },
    "Invoices fetched successfully",
    200
  );
});

export const POST = withApiHandler(async (req, { user }) => {
  if (!user) {
    return formatResponse(false, "Unauthorized", "error", 401);
  }

  const body = await req.json();
  const {
    patientId,
    amount,
    invoiceDate,
    dueDate,
    companyId,
    items,
    notes,
    status,
  } = body;

  if (!patientId || !companyId || !amount || !invoiceDate || !dueDate) {
    return formatResponse(false, "Invalid payload", "error", 400);
  }

  const newInvoice = await prisma.$transaction(async (tx) => {
    return tx.patientInvoices.create({
      data: {
        company: { connect: { id: companyId } },
        patient: { connect: { id: patientId } },
        amount,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        items,
        notes,
        status,
      },
      select: {
        id: true,
        patientId: true,
        amount: true,
        status: true,
        invoiceDate: true,
        dueDate: true,
      },
    });
  });

  return formatResponse(true, newInvoice, "Invoice created successfully", 201);
});
//  => {
//   const { searchParams } = new URL(req.url);
//   const companyId = searchParams.get("companyId");
//   const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
//   const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
//   const status = searchParams.get("status")?.toUpperCase();

//   if (!companyId) return formatResponse(false, "Company ID is required", 'error', 400);

//   // Security & Filter Logic
//   const whereClause: any = { 
//     companyId,
//     ...(status && { status }),
//     ...(user?.role !== "ADMIN" ? { patient: { doctorId: user.id } } : {})
//   };

//   // OPTIMIZATION: Parallelize count and fetch to eliminate waterfall
//   const [totalItems, invoices] = await Promise.all([
//     prisma.patientInvoices.count({ where: whereClause }),
//     prisma.patientInvoices.findMany({
//       where: whereClause,
//       take: limit,
//       skip: (page - 1) * limit,
//       orderBy: { invoiceDate: "desc" },
//       select: {
//         id: true, patientId: true, amount: true, notes: true,
//         dueDate: true, status: true, invoiceDate: true, items: true,
//         patient: { select: { name: true, email: true } },
//       },
//     }),
//   ]);

//   // OPTIMIZATION: Map data efficiently
//   const invoicesData = invoices.map((inv) => {
//     const issued = inv.invoiceDate;
//     return {
//       id: inv.id,
//       userId: inv.patientId,
//       userName: inv.patient?.name ?? "N/A",
//       userEmail: inv.patient?.email ?? "N/A",
//       notes: inv.notes ?? "",
//       amountDue: inv.amount,
//       currency: "USD",
//       dueDate: inv.dueDate?.toISOString() ?? "N/A",
//       status: (inv.status.charAt(0) + inv.status.slice(1).toLowerCase()),
//       downloadUrl: `${apiBaseUrl}/invoices/${companyId}/${inv.id}.pdf`,
//       issuedDate: issued.toISOString(),
//       periodEnd: issued.toISOString(),
//       periodStart: new Date(issued.getTime() - 2592000000).toISOString(), // 30 days in ms
//       lineItems: inv.items,
//     };
//   });

//   return formatResponse(true, {
//     invoicesData,
//     totalInvoiceItems: totalItems,
//     totalInvoicePages: Math.ceil(totalItems / limit),
//   }, "Invoices fetched", 200);
// });

// export const POST = withApiHandler(async (req, { user }) => {
//   const body = await req.json();
//   const { patientId, amount, invoiceDate, dueDate, companyId, items, notes, status } = body;

//   // OPTIMIZATION: Simple validation before DB hit
//   if (!patientId || !companyId || amount === undefined) {
//     return formatResponse(false, "Missing required fields", 'error', 400);
//   }

//   const newInvoice = await prisma.patientInvoices.create({
//     data: {
//       company: { connect: { id: companyId } },
//       patient: { connect: { id: patientId } },
//       amount: parseFloat(amount),
//       invoiceDate: new Date(invoiceDate),
//       dueDate: new Date(dueDate),
//       items,
//       notes,
//       status: status || "UNPAID",
//     },
//     // Only select what the UI needs to confirm creation
//     select: { id: true, status: true, amount: true }
//   });

//   return formatResponse(true, newInvoice, "Invoice created", 201);
// });
// import { NextResponse } from "next/server";
//  => {
  
//   if (!user) {
//     return formatResponse(false, "Unauthorized", 'error', 401);
//   }
  
//   const { searchParams } = new URL(req.url);
  
//   const companyId = searchParams.get("companyId");
//   const page = parseInt(searchParams.get("page") || "1", 10);
//   const limit = parseInt(searchParams.get("limit") || "10", 10);
//   const status = searchParams.get("status")?.toUpperCase();

//   const startIndex = (page - 1) * limit;

//   const whereClause: any = { companyId };

//   if (status) {
//     whereClause.status = status;
//   }

//   // Restrict doctors to invoices for their own patients unless admin
//   if (user?.role !== "ADMIN") {
//     whereClause.patient = { doctorId: user.id };
//   }

//   const totalInvoiceItems = await prisma.patientInvoices.count({ where: whereClause });

//   const invoices = await prisma.patientInvoices.findMany({
//     where: whereClause,
//     take: limit,
//     skip: startIndex,
//     orderBy: { invoiceDate: "desc" },
//     include: {
//       patient: {
//         select: {
//           name: true,
//           email: true,
//         },
//       },
//     },
//   });

//   const invoicesData = invoices.map((inv) => ({
//     id: inv.id,
//     userId: inv.patientId,
//     userName: inv.patient?.name || "N/A",
//     userEmail: inv.patient?.email || "N/A",
//     notes: inv.notes || "",
//     amountDue: inv.amount,
//     currency: "USD", // hardcoded for now
//     dueDate: inv.dueDate?.toISOString() || "N/A",
//     status:
//       (inv.status.charAt(0).toUpperCase() +
//         inv.status.slice(1).toLowerCase()) as "Paid" | "Unpaid" | "Overdue",
//     downloadUrl: `${apiBaseUrl}/invoices/${companyId}/${inv.id}.pdf`,
//     periodStart: new Date(
//       new Date(inv.invoiceDate).getTime() - 30 * 24 * 60 * 60 * 1000
//     ).toISOString(),
//     periodEnd: inv.invoiceDate.toISOString(),
//     issuedDate: inv.invoiceDate.toISOString(),
//     lineItems: inv.items as any,
//   }));

//   const totalInvoicePages = Math.ceil(totalInvoiceItems / limit);

//   return formatResponse(true, {
//       invoicesData,
//       totalInvoiceItems,
//       totalInvoicePages,
//     },
//      "Invoices fetched successfully", 200);
// });

// // --- POST /api/admin/billing/invoices
// export const POST = withApiHandler(async (req, { params, user }) => {

//   if (!user) {
//     return formatResponse(false, "Unauthorized", 'error', 401);
//   }

//   const { patientId, amount, invoiceDate, dueDate, companyId, items, notes, status } = await req.json();
 
//   const newInvoice = await prisma.patientInvoices.create({
//     data: {
//       company: { connect: { id: companyId } },
//       patient: { connect: { id: patientId } },
//       amount,
//       invoiceDate: new Date(invoiceDate),
//       dueDate: new Date(dueDate),
//       items: items,
//       notes: notes,
//       // {
//       //   create: items.map((item: any) => ({
//       //     description: item.description,
//       //     quantity: item.quantity,
//       //     price: item.price,
//       //   })),
//       // },
//       status,
//     },
//   });

//   return formatResponse(true, newInvoice, "Invoice created successfully", 201);
// });