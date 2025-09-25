import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import type { NextRequest } from 'next/server';
import { resolveCname, resolveTxt } from 'dns/promises';
import { getSession } from 'next-auth/react';
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";

export async function POST(req: NextRequest) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { domain } = await req.json();

  // 1) Auth: make sure the user is logged in
  const session = await getSession({ req });

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Simple input check
  if (typeof domain !== 'string' || !domain.includes('.')) {
    return NextResponse.json({ error: 'Invalid domain format.' }, { status: 400 });
  }

  // 3) DNS lookup: require a CNAME pointing to your host, e.g. app.example.com
  const expectedHost = 'app.your-production-domain.com';

  let records: string[];

  try {

    records = await resolveCname(domain);

  } catch (err) {
    // fallback: maybe they used a TXT record instead?
    try {
      const txt = await resolveTxt(domain);
      records = txt.flat();
    } catch {
      return NextResponse.json(
        { error: `No CNAME or TXT record found for ${domain}` },
        { status: 400 }
      );
    }
  }

  if (!records.includes(expectedHost)) {
    return NextResponse.json(
      { error: `DNS record must point to ${expectedHost}. Found: ${records.join(', ')}` },
      { status: 400 }
    );
  }

  // 4) Persist the custom domain in your database
  const company = await prisma.company.updateMany({
    where: { userId: session.user.id },
    data:  { domain },
  })
  if (company.count === 0) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  return NextResponse.json({ message: `${domain} connected!` })
  
  // await prisma.customDomain.create({
  //   data: {
  //     domain,
  //     userEmail: session.user.email,
  //     // or link to storeId, etc.
  //   },
  // });

  return NextResponse.json({ message: `${domain} connected successfully!` });
}

// app/api/custom-domain/route.ts


export async function POST(req: NextRequest) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { domain } = await req.json()
  const session = await getSession({ req })

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  // Basic format check
  if (typeof domain !== 'string' || !domain.includes('.')) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
  }

  // 1) DNS check
  const expectedTarget = 'app.your-production-domain.com'
  let records: string[] = []
  try {
    records = await resolveCname(domain)
  } catch {
    // fallback to TXT
    try {
      const txt = await resolveTxt(domain)
      records = txt.flat()
    } catch {
      return NextResponse.json(
        { error: `No CNAME or TXT record found for ${domain}` },
        { status: 400 }
      )
    }
  }
  if (!records.includes(expectedTarget)) {
    return NextResponse.json(
      { error: `DNS must point to ${expectedTarget}. Found: ${records.join(', ')}` },
      { status: 400 }
    )
  }

  // 2) Persist on the Company record
  //    Assume you have a one‑to‑one link Company ↔ User via userId
  const company = await prisma.company.updateMany({
    where: { userId: session.user.id },
    data:  { domain },
  })
  if (company.count === 0) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  return NextResponse.json({ message: `${domain} connected!` })
}
