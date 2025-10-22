import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { exec } from "child_process";
import util from "util";
import dns from "dns";

const execPromise = util.promisify(exec);
const resolvePromise = util.promisify(dns.resolve);
const resolveCnamePromise = util.promisify(dns.resolveCname);

// 🧩 Schema validation
const DomainSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain is too short")
    .regex(
      /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid domain format (e.g., yourdomain.com)"
    ),
  companyId: z.string().optional(),
});

// 🧠 Configurable constants
const PLATFORM_BASE_DOMAIN = process.env.PLATFORM_BASE_DOMAIN || "";
const VPS_IP = process.env.VPS_IP || ""; // Change to your actual VPS IP
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const USE_STAGING = process.env.USE_STAGING === "true";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parse = DomainSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.issues[0].message },
        { status: 400 }
      );
    }

    const { domain, companyId } = parse.data;

    // 🔒 Optional authentication
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user?.email) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // 🧠 Fetch company record
    const company = await prisma.company.findFirst({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // 🚫 Prevent duplicate domain
    const existing = await prisma.company.findFirst({
      where: { domain },
    });

    if (existing && existing.id !== company.id) {
      return NextResponse.json(
        { error: "Domain already in use by another account" },
        { status: 409 }
      );
    }

    // ✅ Update company domain
    await prisma.company.update({
      where: { id: company.id },
      data: { domain, hasWebsite: true },
    });

    // 🧩 DNS Verification Step
    let dnsVerified = false;
    try {
      console.log(`🔍 Checking DNS records for ${domain}...`);
       const aRecords = await resolvePromise(domain).catch(() => [] as string[]);
      const cnameRecords = await resolveCnamePromise(domain).catch(() => [] as string[]);

      console.log("A records:", aRecords);
      console.log("CNAME records:", cnameRecords);

      const pointsToIP = aRecords.includes(VPS_IP);
      const pointsToPlatform =
        cnameRecords.some((c) => c.endsWith(PLATFORM_BASE_DOMAIN)) ||
        aRecords.includes(VPS_IP);

      if (pointsToIP || pointsToPlatform) {
        dnsVerified = true;
        console.log(`✅ DNS verified for ${domain}`);
      } else {
        console.warn(`⚠️ Domain ${domain} does not point to ${PLATFORM_BASE_DOMAIN} or ${VPS_IP}`);
      }
    } catch (dnsError: any) {
      console.error("⚠️ DNS verification error:", dnsError.message);
    }

    if (!dnsVerified) {
      return NextResponse.json({
        success: false,
        warning: `Domain ${domain} is saved but DNS is not correctly configured yet.`,
        hint: `Please point your domain's A record to ${VPS_IP} or CNAME to your subdomain (e.g., yourshop.${PLATFORM_BASE_DOMAIN}).`,
      });
    }

    // 🧠 SSL Issuance with Certbot
    try {
      const stagingFlag = USE_STAGING ? "--staging" : "";
      const cmd = `sudo certbot certonly --nginx ${stagingFlag} -d ${domain} -d www.${domain} --non-interactive --agree-tos -m ${ADMIN_EMAIL}`;
      console.log(`🔧 Running SSL issuance: ${cmd}`);

      const { stdout, stderr } = await execPromise(cmd);
      if (stdout) console.log("✅ Certbot stdout:", stdout);
      if (stderr) console.warn("⚠️ Certbot stderr:", stderr);

      // 🔁 Reload NGINX
      await execPromise("sudo systemctl reload nginx");
      console.log("✅ NGINX reloaded successfully after SSL issuance.");
    } catch (sslError: any) {
      console.error("⚠️ SSL issuance failed:", sslError.message);
      if (sslError.stderr) console.error("Certbot stderr:", sslError.stderr);
      if (sslError.stdout) console.error("Certbot stdout:", sslError.stdout);
    }

    return NextResponse.json({
      success: true,
      message: `Domain "${domain}" connected successfully! SSL setup is being processed.`,
    });
  } catch (error: any) {
    console.error("❌ Domain API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findFirst({
      where: { id: companyId },
      select: { domain: true, hasWebsite: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      domain: company.domain,
      hasWebsite: company.hasWebsite,
    });
  } catch (error: any) {
    console.error("❌ Domain GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { z } from "zod";
// import { exec } from "child_process";
// import util from "util";

// const execPromise = util.promisify(exec);

// // 🧩 Schema validation using Zod
// const DomainSchema = z.object({
//   domain: z
//     .string()
//     .min(3, "Domain is too short")
//     .regex(
//       /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
//       "Invalid domain format (e.g., yourdomain.com)"
//     ),
//   companyId: z.string().optional(), // Optional for admin-level setup
// });

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const parse = DomainSchema.safeParse(body);

//     if (!parse.success) {
//       return NextResponse.json(
//         { error: parse.error.issues[0].message },
//         { status: 400 }
//       );
//     }

//     const { domain, companyId } = parse.data;

//     // 🔒 Optional Authentication (uncomment if needed)
//     // const session = await getServerSession(authOptions);
//     // if (!session || !session.user?.email) {
//     //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     // }

//     // 🧠 Find the company by ID (you could also use session.user.email if tied to account)
//     const company = await prisma.company.findFirst({
//       where: { id: companyId },
//     });

//     if (!company) {
//       return NextResponse.json(
//         { error: "Company not found" },
//         { status: 404 }
//       );
//     }

//     // 🚫 Check for duplicate domains
//     const existing = await prisma.company.findFirst({
//       where: { domain },
//     });

//     if (existing && existing.id !== company.id) {
//       return NextResponse.json(
//         { error: "Domain already in use by another account" },
//         { status: 409 }
//       );
//     }

//     // ✅ Update company's domain
//     await prisma.company.update({
//       where: { id: company.id },
//       data: { domain, hasWebsite: true },
//     });

//     // 🧠 Run Certbot to issue SSL certificate for this domain
//     try {
//       const adminEmail = "brendenodhiambo@gmail.com"; // Change to your admin email
//       const cmd = `sudo certbot certonly --nginx -d ${domain} -d www.${domain} --non-interactive --agree-tos -m ${adminEmail}`;

//       console.log(`🔧 Running SSL issuance: ${cmd}`);

//       const { stdout, stderr } = await execPromise(cmd);
//       if (stdout) console.log("✅ Certbot stdout:", stdout);
//       if (stderr) console.warn("⚠️ Certbot stderr:", stderr);

//       // 🔁 Reload NGINX after SSL issuance
//       await execPromise("sudo systemctl reload nginx");
//       console.log("✅ NGINX reloaded successfully after SSL issuance.");
//     } catch (sslError: any) {
//       console.error("⚠️ SSL issuance failed:", sslError.message);

//       // Log detailed error for debugging
//       if (sslError.stderr) console.error("Certbot stderr:", sslError.stderr);
//       if (sslError.stdout) console.error("Certbot stdout:", sslError.stdout);

//       // Don't block main request — allow user to retry later
//     }

//     return NextResponse.json({
//       success: true,
//       message: `Domain "${domain}" connected successfully! SSL setup is in progress.`,
//     });
//   } catch (error: any) {
//     console.error("❌ Domain API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const companyId = searchParams.get("companyId");

//     if (!companyId) {
//       return NextResponse.json(
//         { error: "companyId is required" },
//         { status: 400 }
//       );
//     }

//     const company = await prisma.company.findFirst({
//       where: { id: companyId },
//       select: { domain: true, hasWebsite: true },
//     });

//     if (!company) {
//       return NextResponse.json(
//         { error: "Company not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       domain: company.domain,
//       hasWebsite: company.hasWebsite,
//     });
//   } catch (error: any) {
//     console.error("❌ Domain GET API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


// // File: /app/api/custom-domain/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"; // if you use NextAuth
// import { z } from "zod";

// // ✅ Schema validation (using Zod)
// const DomainSchema = z.object({
//   domain: z
//     .string()
//     .min(3, "Domain is too short")
//     .regex(
//       /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
//       "Invalid domain format (e.g., yourdomain.com)"
//     ),
// });

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const parse = DomainSchema.safeParse(body);

//     if (!parse.success) {
//       return NextResponse.json({ error: parse.error.issues[0].message }, { status: 400 });
//     }

//     const { domain } = parse.data;

//     // ✅ Optional authentication check
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Find company by user (assuming each user owns one company)
//     const company = await prisma.company.findFirst({
//       where: { contactEmail: session.user.email },
//     });

//     if (!company) {
//       return NextResponse.json({ error: "Company not found" }, { status: 404 });
//     }

//     // ✅ Check if domain is already taken
//     const existing = await prisma.company.findFirst({
//       where: { domain },
//     });

//     if (existing && existing.id !== company.id) {
//       return NextResponse.json({ error: "Domain already in use by another account" }, { status: 409 });
//     }

//     // ✅ Update the domain
//     await prisma.company.update({
//       where: { id: company.id },
//       data: { domain, hasWebsite: true },
//     });

//     return NextResponse.json({
//       success: true,
//       message: `Domain "${domain}" connected successfully!`,
//     });
//   } catch (error: any) {
//     console.error("Domain API error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const company = await prisma.company.findFirst({
//       where: { contactEmail: session.user.email },
//       select: { domain: true, hasWebsite: true },
//     });

//     if (!company) {
//       return NextResponse.json({ error: "Company not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       domain: company.domain,
//       hasWebsite: company.hasWebsite,
//     });
//   } catch (error: any) {
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
