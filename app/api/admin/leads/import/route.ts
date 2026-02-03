import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const companyId = formData.get("companyId") as string;

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const text = await file.text();
  let users: any[];

  try {
    users = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
  }

  let created = 0;
  let skipped = 0;

  for (const u of users) {
    const phone = normalizePhone(u.phoneNumber || u.phone);

    if (!phone) {
      skipped++;
      continue;
    }

    try {
      await prisma.lead.upsert({
        where: { phone },
        update: {},
        create: {
          phone,
          name: `${u.name}` || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
          email: u.email || null,
          createdAt: u.createdAt?.$date
            ? new Date(u.createdAt.$date)
            : new Date(),
          stage: "cold",
          companyId,
        },
      });

      created++;
    } catch (err) {
      skipped++;
    }
  }

  return NextResponse.json({
    success: true,
    total: users.length,
    created,
    skipped,
  });
}

// --- Helpers ---
function normalizePhone(phone?: string) {
  if (!phone) return null;

  let p = phone.replace(/\s+/g, "");

  if (p.startsWith("0")) p = "+254" + p.slice(1);
  if (p.startsWith("254")) p = "+" + p;

  if (!p.startsWith("+254")) return null;

  return p;
}
