import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { z } from "zod";
import { exec } from "child_process";
import util from "util";
import dns from "dns";
import fs from "fs";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const execPromise = util.promisify(exec);
const resolvePromise = util.promisify(dns.resolve);
const resolveCnamePromise = util.promisify(dns.resolveCname);

// ===========================
// CONFIG CONSTANTS
// ===========================
const PLATFORM_BASE_DOMAIN = process.env.PLATFORM_BASE_DOMAIN || "salesmanpro.site";
const VPS_IP = process.env.VPS_IP || "YOUR_SERVER_IP";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@salesmanpro.site";
const USE_STAGING = process.env.USE_STAGING === "true" || false;

const CERTBOT_BASE_PATH = "/etc/letsencrypt/live";
const NGINX_SNIPPET_DIR = "/etc/nginx/snippets";

// ===========================
// DOMAIN VALIDATION SCHEMA
// ===========================
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

// ===========================
// POST - Connect a domain
// ===========================
export const POST = withApiHandler(async (req: Request) => {
  try {
    const body = await req.json();
    const parse = DomainSchema.safeParse(body);
    if (!parse.success)
      return NextResponse.json({ error: parse.error.issues[0].message }, { status: 400 });

    const { domain, companyId } = parse.data;

    // 1️⃣ Find company
    const company = await prisma.company.findFirst({ where: { id: companyId } });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    // 2️⃣ Check if domain already exists
    const existing = await prisma.company.findFirst({ where: { domain } });
    if (existing && existing.id !== company.id)
      return NextResponse.json(
        { error: "Domain already used by another tenant" },
        { status: 409 }
      );

    // 3️⃣ Save the domain in DB
    await prisma.company.update({
      where: { id: company.id },
      data: { domain, hasWebsite: true },
    });

    // 4️⃣ Verify DNS (A or CNAME)
    let dnsVerified = false;
    try {
      console.log(`🔍 Checking DNS for ${domain}...`);
      const aRecords = await resolvePromise(domain).catch(() => [] as string[]);
      const cnameRecords = await resolveCnamePromise(domain).catch(() => [] as string[]);

      const pointsToIP = aRecords.includes(VPS_IP);
      const pointsToPlatform =
        cnameRecords.some((c) => c.endsWith(PLATFORM_BASE_DOMAIN)) || pointsToIP;

      dnsVerified = pointsToPlatform;
      console.log(
        dnsVerified
          ? `✅ DNS verified for ${domain}`
          : `⚠️ ${domain} not pointing to ${PLATFORM_BASE_DOMAIN} or ${VPS_IP}`
      );
    } catch (dnsError: any) {
      console.error("⚠️ DNS check failed:", dnsError.message);
    }

    if (!dnsVerified) {
      return NextResponse.json({
        success: false,
        warning: `Domain ${domain} saved, but DNS is not yet correctly configured.`,
        hint: `Please point A record to ${VPS_IP} or CNAME to ${PLATFORM_BASE_DOMAIN}.`,
      });
    }

    // 5️⃣ SSL Handling
    const certDir = `${CERTBOT_BASE_PATH}/${domain}`;
    const wildcardCertDir = `${CERTBOT_BASE_PATH}/${PLATFORM_BASE_DOMAIN}`;

    let usingWildcard = false;

    // If subdomain of base domain → use wildcard cert
    if (domain.endsWith(`.${PLATFORM_BASE_DOMAIN}`)) {
      usingWildcard = true;
      console.log(`🔄 Using existing wildcard cert for ${domain}`);
    } else {
      // Otherwise, issue a new cert for the custom domain
      console.log(`🔧 Issuing SSL for ${domain}...`);
      const stagingFlag = USE_STAGING ? "--staging" : "";
      const cmd = `sudo certbot certonly --nginx ${stagingFlag} -d ${domain} -d www.${domain} --non-interactive --agree-tos -m ${ADMIN_EMAIL}`;

      try {
        const { stdout, stderr } = await execPromise(cmd);
        if (stdout) console.log("✅ Certbot output:", stdout);
        if (stderr) console.warn("⚠️ Certbot warnings:", stderr);
      } catch (err: any) {
        console.error("❌ Certbot failed:", err.message);
        if (err.stdout) console.error("STDOUT:", err.stdout);
        if (err.stderr) console.error("STDERR:", err.stderr);
        return NextResponse.json(
          { error: `SSL issuance failed for ${domain}`, details: err.message },
          { status: 500 }
        );
      }
    }

    // 6️⃣ Verify cert files exist
    const certPath = usingWildcard
      ? `${wildcardCertDir}/fullchain.pem`
      : `${certDir}/fullchain.pem`;
    const keyPath = usingWildcard
      ? `${wildcardCertDir}/privkey.pem`
      : `${certDir}/privkey.pem`;

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      await execPromise(`sudo rm -f ${NGINX_SNIPPET_DIR}/ssl-${domain}.conf`);
      console.error(`❌ Missing cert files for ${domain}`);
      return NextResponse.json(
        { error: `SSL certificate files not found for ${domain}` },
        { status: 500 }
      );
    }

    

    // 7️⃣ Write NGINX snippet
    const snippetPath = `${NGINX_SNIPPET_DIR}/ssl-${domain}.conf`;
    const snippetContent = `
      # Auto-generated SSL server for ${domain}
      server {
          listen 443 ssl http2;
          listen [::]:443 ssl http2;
          server_name ${domain} www.${domain};

          ssl_certificate     ${certPath};
          ssl_certificate_key ${keyPath};

          ssl_protocols TLSv1.2 TLSv1.3;
          ssl_ciphers HIGH:!aNULL:!MD5;
          ssl_prefer_server_ciphers on;

          location / {
              proxy_pass http://localhost:3000;
              proxy_http_version 1.1;

              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection "upgrade";
              proxy_set_header Host $host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto $scheme;

              proxy_cache_bypass $http_upgrade;
          }

          location /.well-known/acme-challenge/ {
              root /var/www/certbot;
          }
      }
      `;


//     const snippetContent = `
// # Auto-generated SSL snippet for ${domain}
// server_name ${domain} www.${domain};
// ssl_certificate ${certPath};
// ssl_certificate_key ${keyPath};
// `;
    try {
      await execPromise(`echo "${snippetContent}" | sudo tee ${snippetPath} > /dev/null`);
      console.log(`✅ Created NGINX snippet: ${snippetPath}`);
    } catch (err: any) {
      console.error("⚠️ Failed to create snippet:", err.message);
    }

    // 8️⃣ Reload NGINX
    try {
      await execPromise("sudo nginx -t");
      await execPromise("sudo systemctl reload nginx");
      console.log("✅ NGINX reloaded successfully.");
    } catch (err: any) {
      console.error("⚠️ Failed to reload NGINX:", err.message);
    }

    return NextResponse.json({
      success: true,
      message: `Domain "${domain}" connected successfully.`,
      ssl: usingWildcard ? "Using wildcard SSL" : "Dedicated SSL issued",
    });
  } catch (error: any) {
    console.error("❌ Domain API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// ===========================
// GET - Get current domain info
// ===========================
export const GET = withApiHandler(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId)
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });

    const company = await prisma.company.findFirst({
      where: { id: companyId },
      select: { domain: true, hasWebsite: true, slug: true },
    });

    if (!company)
      return NextResponse.json({ error: "Company not found" }, { status: 404 });

    return NextResponse.json({
      domain: company.domain,
      hasWebsite: company.hasWebsite,
      slug: company.slug,
    });
  } catch (error: any) {
    console.error("❌ Domain GET API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { z } from "zod";
// import { exec } from "child_process";
// import util from "util";
// import dns from "dns";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// const execPromise = util.promisify(exec);
// const resolvePromise = util.promisify(dns.resolve);
// const resolveCnamePromise = util.promisify(dns.resolveCname);

// // 🧩 Schema validation
// const DomainSchema = z.object({
//   domain: z
//     .string()
//     .min(3, "Domain is too short")
//     .regex(
//       /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
//       "Invalid domain format (e.g., yourdomain.com)"
//     ),
//   companyId: z.string().optional(),
// });

// // 🧠 Configurable constants
// const PLATFORM_BASE_DOMAIN = process.env.PLATFORM_BASE_DOMAIN || "";
// const VPS_IP = process.env.VPS_IP || ""; // Change to your actual VPS IP
// const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
// const USE_STAGING = process.env.USE_STAGING === "true" || false;

// export const POST = withApiHandler(async (req: Request) => {
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

//     // 🧠 Fetch company record
//     const company = await prisma.company.findFirst({
//       where: { id: companyId },
//     });

//     if (!company) {
//       return NextResponse.json({ error: "Company not found" }, { status: 404 });
//     }

//     // 🚫 Prevent duplicate domain
//     const existing = await prisma.company.findFirst({
//       where: { domain },
//     });

//     if (existing && existing.id !== company.id) {
//       return NextResponse.json(
//         { error: "Domain already in use by another account" },
//         { status: 409 }
//       );
//     }

//     // ✅ Update company domain
//     await prisma.company.update({
//       where: { id: company.id },
//       data: { domain, hasWebsite: true },
//     });

//     // 🧩 DNS Verification Step
//     let dnsVerified = false;
//     try {
//       console.log(`🔍 Checking DNS records for ${domain}...`);
//        const aRecords = await resolvePromise(domain).catch(() => [] as string[]);
//       const cnameRecords = await resolveCnamePromise(domain).catch(() => [] as string[]);

//       console.log("A records:", aRecords);
//       console.log("CNAME records:", cnameRecords);

//       const pointsToIP = aRecords.includes(VPS_IP);
//       const pointsToPlatform =
//         cnameRecords.some((c) => c.endsWith(PLATFORM_BASE_DOMAIN)) ||
//         aRecords.includes(VPS_IP);

//       if (pointsToIP || pointsToPlatform) {
//         dnsVerified = true;
//         console.log(`✅ DNS verified for ${domain}`);
//       } else {
//         console.warn(`⚠️ Domain ${domain} does not point to ${PLATFORM_BASE_DOMAIN} or ${VPS_IP}`);
//       }
//     } catch (dnsError: any) {
//       console.error("⚠️ DNS verification error:", dnsError.message);
//     }

//     if (!dnsVerified) {
//       return NextResponse.json({
//         success: false,
//         warning: `Domain ${domain} is saved but DNS is not correctly configured yet.`,
//         hint: `Please point your domain's A record to ${VPS_IP} or CNAME to your subdomain (e.g., yourshop.${PLATFORM_BASE_DOMAIN}).`,
//       });
//     }

//     // 🧠 SSL Issuance with Certbot
//     try {
//       const stagingFlag = USE_STAGING ? "--staging" : "";
//       const cmd = `sudo certbot certonly --nginx ${stagingFlag} -d ${domain} -d www.${domain} --non-interactive --agree-tos -m ${ADMIN_EMAIL}`;
//       console.log(`🔧 Running SSL issuance: ${cmd}`);

//       const { stdout, stderr } = await execPromise(cmd);
//       if (stdout) console.log("✅ Certbot stdout:", stdout);
//       if (stderr) console.warn("⚠️ Certbot stderr:", stderr);


//       // 🧩 Create NGINX snippet for dynamic SSL loading
//       try {
//         const snippetPath = `/etc/nginx/snippets/ssl-${domain}.conf`;
//         const snippetContent = `
//                                 ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
//                                 ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
//                                 `;

//         // Write snippet file
//         await execPromise(`echo "${snippetContent}" | sudo tee ${snippetPath} > /dev/null`);
//         console.log(`✅ Created SSL snippet: ${snippetPath}`);

        
//       // 🔁 Reload NGINX
//       await execPromise("sudo systemctl reload nginx");
//       console.log("✅ NGINX reloaded successfully after SSL issuance.");

//       } catch (snippetError: any) {
//         console.error("⚠️ Failed to create SSL snippet:", snippetError.message);
//       }

//     } catch (sslError: any) {
//       console.error("⚠️ SSL issuance failed:", sslError.message);
//       if (sslError.stderr) console.error("Certbot stderr:", sslError.stderr);
//       if (sslError.stdout) console.error("Certbot stdout:", sslError.stdout);
//     }

//     return NextResponse.json({
//       success: true,
//       message: `Domain "${domain}" connected successfully! SSL setup is being processed.`,
//     });
//   } catch (error: any) {
//     console.error("❌ Domain API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// });

// export const GET = withApiHandler(async (req: Request) => {
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
//       select: { domain: true, hasWebsite: true, slug:true },
//     });

//     if (!company) {
//       return NextResponse.json({ error: "Company not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       domain: company.domain,
//       hasWebsite: company.hasWebsite,
//       slug: company.slug
//     });
//   } catch (error: any) {
//     console.error("❌ Domain GET API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// });

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
