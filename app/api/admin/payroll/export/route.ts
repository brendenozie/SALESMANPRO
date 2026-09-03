import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "Company ID required" }, { status: 400 });

  try {
    // 1. Fetch staff with their bank details and payroll profiles
    
    const cacheKey = buildTenantCacheKey(companyId, "export", {});

  // try {
  //   const cached = await cacheGet(cacheKey);
  //   if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  // } catch (e) {}

  const staff = await prisma.staffProfile.findMany({
      where: { companyId },
      include: { 
        user: { select: { name: true } } 
      }
    });

  // try {
  //   if (staff) {
  //     await cacheSet(cacheKey, staff, 60);
  //   }
  // } catch (e) {}

    // 2. Construct CSV Header
    let csvContent = "Beneficiary Name,Account Number,Bank Code,Amount,Currency,Payment Reference\n";

    // 3. Map staff data to CSV rows
    staff.forEach((member) => {
      const name = member.user.name;
      // Assuming bankAccount and bankCode are fields in your StaffProfile
      const account = member.bankAccount || "0000000000"; 
      const bCode = member.bankCode || "N/A";
      
      // Calculate Net (Base - 15% Tax)
      const base = member.salary || 0;
      const netAmount = (base * 0.85).toFixed(2);
      
      const reference = `PAYROLL_JAN26_${member.id.substring(0, 5).toUpperCase()}`;

      csvContent += `"${name}","${account}","${bCode}",${netAmount},"USD","${reference}"\n`;
    });

    // 4. Return as a downloadable file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=Payroll_Export_Jan_2026.csv`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}