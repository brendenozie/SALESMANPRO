// // // app/api/custom-domain/route.ts

// app/api/custom-domain/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveCname, resolveTxt } from "dns/promises";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                CONFIG                                      */
/* -------------------------------------------------------------------------- */

const EXPECTED_TARGET = "app.your-production-domain.com";

/* -------------------------------------------------------------------------- */
/*                               VALIDATION                                   */
/* -------------------------------------------------------------------------- */

const DomainSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(253)
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/,
      "Invalid domain format"
    ),
});

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  /* ----------------------------- Auth check ----------------------------- */

  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  const user = auth.user;
  if (!user) {
    return formatResponse(false, null, "User not found", 404);
  }

  /* ----------------------------- Body parse ----------------------------- */

  const body = await req.json();
  const parsed = DomainSchema.safeParse(body);

  if (!parsed.success) {
    return formatResponse(
      false,
      null,
      parsed.error.errors[0].message,
      400
    );
  }

  // Normalize domain
  const domain = parsed.data.domain.toLowerCase().trim();

  /* ---------------------- Prevent duplicate usage ----------------------- */

  const existingDomain = await prisma.company.findFirst({
    where: { domain },
    select: { id: true },
  });

  if (existingDomain) {
    return formatResponse(
      false,
      null,
      "Domain is already connected to another company.",
      409
    );
  }

  /* ------------------------- DNS Verification --------------------------- */

  let cnameRecords: string[] = [];
  let txtRecords: string[] = [];

  try {
    const [cname, txt] = await Promise.allSettled([
      resolveCname(domain),
      resolveTxt(domain),
    ]);

    if (cname.status === "fulfilled") {
      cnameRecords = cname.value;
    }

    if (txt.status === "fulfilled") {
      txtRecords = txt.value.flat();
    }

    if (!cnameRecords.length && !txtRecords.length) {
      return formatResponse(
        false,
        null,
        `No CNAME or TXT records found for ${domain}`,
        400
      );
    }

  } catch {
    return formatResponse(
      false,
      null,
      "DNS lookup failed. Please try again.",
      500
    );
  }

  const allRecords = [...cnameRecords, ...txtRecords];

  const isValid =
    cnameRecords.includes(EXPECTED_TARGET) ||
    txtRecords.includes(EXPECTED_TARGET);

  if (!isValid) {
    return formatResponse(
      false,
      null,
      `DNS must point to ${EXPECTED_TARGET}. Found: ${allRecords.join(", ")}`,
      400
    );
  }

  /* -------------------------- Update Company ---------------------------- */

  const company = await prisma.company.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  await prisma.company.update({
    where: { id: company.id },
    data: { domain },
  });

  return formatResponse(
    true,
    { domain },
    `${domain} connected successfully!`,
    200
  );
}
// import { NextRequest } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { resolveCname, resolveTxt } from "dns/promises";
// import { verifyAuth } from "@/lib/verifyAuth";
// import { formatResponse } from "@/lib/formatResponse";

// const DNS_TIMEOUT = 5000; // 5 seconds
// const EXPECTED_TARGET = "app.your-production-domain.com";

// /**
//  * Helper to resolve DNS with a timeout guard
//  */
// async function resolveWithTimeout<T>(promise: Promise<T>): Promise<T> {
//   const timeout = new Promise<never>((_, reject) =>
//     setTimeout(() => reject(new Error("DNS_TIMEOUT")), DNS_TIMEOUT)
//   );
//   return Promise.race([promise, timeout]);
// }

// export async function POST(req: NextRequest) {
//   const auth = await verifyAuth(req);
//   if (!auth.success || !auth.user) {
//     return formatResponse(false, null, auth.error || "Unauthorized", 401);
//   }

//   const body = await req.json();
//   const rawDomain = body.domain?.trim().toLowerCase();

//   // 1. Rigorous Input Validation
//   if (!rawDomain || !/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(rawDomain)) {
//     return formatResponse(false, null, "Invalid domain format", 400);
//   }

//   // 2. Prevent Domain Hijacking (Check if already linked)
//   const existing = await prisma.company.findFirst({
//     where: { domain: rawDomain },
//     select: { id: true }
//   });
  
//   if (existing) {
//     return formatResponse(false, null, "This domain is already connected to another account", 409);
//   }

//   // 3. DNS Lookup: Parallel check for CNAME and TXT
//   let isVerified = false;
//   let foundRecords: string[] = [];

//   try {
//     // We check both simultaneously to support different provider setups
//     const [cnameResults, txtResults] = await Promise.allSettled([
//       resolveWithTimeout(resolveCname(rawDomain)),
//       resolveWithTimeout(resolveTxt(rawDomain))
//     ]);

//     if (cnameResults.status === 'fulfilled') {
//       foundRecords.push(...cnameResults.value);
//     }
//     if (txtResults.status === 'fulfilled') {
//       foundRecords.push(...txtResults.value.flat());
//     }

//     // Check if any record matches our target
//     isVerified = foundRecords.some(rec => rec.toLowerCase() === EXPECTED_TARGET);
//   } catch (error: any) {
//     const msg = error.message === "DNS_TIMEOUT" ? "DNS lookup timed out" : "DNS resolution failed";
//     return formatResponse(false, null, msg, 504);
//   }

//   if (!isVerified) {
//     return formatResponse(
//       false, 
//       null, 
//       `Verification failed. Ensure a CNAME or TXT record points to ${EXPECTED_TARGET}.`, 
//       400
//     );
//   }

//   // 4. Atomic Update
//   try {
//     const updatedCompany = await prisma.company.update({
//       where: { userId: auth.user.id },
//       data: { domain: rawDomain },
//       select: { id: true, domain: true }
//     });

//     return formatResponse(true, { domain: updatedCompany.domain }, "Domain connected successfully!");
//   } catch (error) {
//     return formatResponse(false, null, "Company profile not found", 404);
//   }
// }
// import { NextRequest } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { resolveCname, resolveTxt } from "dns/promises";
// import { verifyAuth } from "@/lib/verifyAuth";
// import { formatResponse } from "@/lib/formatResponse";

// export async function POST(req: NextRequest) {
//   // 1) Verify authentication
//   const auth = await verifyAuth(req);
  
//   if (!auth.success) {
//     return formatResponse(false, null, auth.error, 401);
//   }

//   const { domain } = await req.json();

//   // 2) Input validation
//   if (typeof domain !== "string" || !domain.includes(".")) {
//     return formatResponse(false, null, "Invalid domain format", 400);
//   }

//   // 3) DNS lookup: check for CNAME or TXT record
//   const expectedTarget = "app.your-production-domain.com";
//   let records: string[] = [];

//   try {
//     records = await resolveCname(domain);
//   } catch {
//     try {
//       const txt = await resolveTxt(domain);
//       records = txt.flat();
//     } catch {
//       return formatResponse(false, null, `No CNAME or TXT record found for ${domain}`, 400);
//     }
//   }

//   if (!records.includes(expectedTarget)) {
//     return formatResponse(
//       false,
//       null,
//       `DNS must point to ${expectedTarget}. Found: ${records.join(", ")}`,
//       400
//     );
//   }

//   const user = await auth.user || '';

//   if (!user) { 
//     return formatResponse(false, null, "User not found", 404);
//   }

//   // 4) Persist on the company record (assuming auth.userId maps to Company.userId)
//   const company = await prisma.company.updateMany({
//     where: { userId: user.id },
//     data: { domain },
//   });

//   if (company.count === 0) {
//     return formatResponse(false, null, "Company not found", 404);
//   }

//   return formatResponse(true, { domain }, `${domain} connected successfully!`);
// }
