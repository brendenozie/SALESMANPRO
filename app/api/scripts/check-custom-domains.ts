// File: /scripts/check-custom-domains.ts
import prisma from "@/server/db/prismadb";
import { exec } from "child_process";
import util from "util";
import dns from "dns";

const execPromise = util.promisify(exec);
const resolvePromise = util.promisify(dns.resolve);
const resolveCnamePromise = util.promisify(dns.resolveCname);

// 🧠 Constants (same as API)
const VPS_IP = process.env.VPS_IP || "";
const PLATFORM_BASE_DOMAIN = process.env.PLATFORM_BASE_DOMAIN || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const USE_STAGING = process.env.USE_STAGING === "true";

async function verifyDNS(domain: string) {
  try {
    // const aRecords = await resolvePromise(domain).catch(() => []);
    // const cnameRecords = await resolveCnamePromise(domain).catch(() => []);
    
    const aRecords = await resolvePromise(domain).catch(() => [] as string[]);
    const cnameRecords = await resolveCnamePromise(domain).catch(() => [] as string[]);

    const pointsToIP = aRecords.includes(VPS_IP);
    const pointsToPlatform = cnameRecords.some((c) =>
      c.endsWith(PLATFORM_BASE_DOMAIN)
    );

    return pointsToIP || pointsToPlatform;
  } catch {
    return false;
  }
}

async function checkCertbotCertificate(domain: string): Promise<boolean> {
  try {
    const { stdout } = await execPromise(
      `sudo certbot certificates | grep "Domains: " | grep ${domain}`
    );
    return !!stdout && stdout.includes(domain);
  } catch {
    return false;
  }
}

async function issueSSL(domain: string) {
  try {
    const stagingFlag = USE_STAGING ? "--staging" : "";
    const cmd = `sudo certbot certonly --nginx ${stagingFlag} -d ${domain} -d www.${domain} --non-interactive --agree-tos -m ${ADMIN_EMAIL}`;
    console.log(`🔧 Issuing SSL for ${domain}...`);
    const { stdout, stderr } = await execPromise(cmd);
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
    await execPromise("sudo systemctl reload nginx");
    console.log(`✅ SSL issued and NGINX reloaded for ${domain}`);
  } catch (err: any) {
    console.error(`❌ Failed to issue SSL for ${domain}:`, err.message);
  }
}

async function main() {
  console.log("🚀 Starting custom domain SSL verification job...");
  const companies = await prisma.company.findMany({
    where: { sslStatus: "PENDING" },
    select: { id: true, domain: true },
  });

  for (const c of companies) {
    const domain = c.domain!;
    console.log(`🔍 Checking ${domain}...`);

    const dnsOk = await verifyDNS(domain);
    if (!dnsOk) {
      console.warn(`⚠️ Skipping ${domain}: DNS not correctly configured.`);
      continue;
    }

    const hasCert = await checkCertbotCertificate(domain);
    if (hasCert) {
      console.log(`✅ SSL already exists for ${domain}.`);
      continue;
    }

    console.log(`🚀 DNS OK but no SSL — issuing certificate for ${domain}...`);
    await issueSSL(domain);

    await prisma.company.update({
          where: { id: c.id },
          data: { sslStatus: "active", hasWebsite: true },
        });
  }

  console.log("🎉 Custom domain SSL job finished.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ SSL Cron Job Error:", err);
  process.exit(1);
});
