// // /scripts/check-custom-domains.ts
// scripts/check-custom-domains.ts
import prisma from "@/server/db/prismadb";
import { promises as dnsPromises } from "dns";
import fs from "fs";
import { spawn } from "child_process";

const resolveA = dnsPromises.resolve4;
const resolveCname = dnsPromises.resolveCname;

// ===========================
// CONFIG
// ===========================
const VPS_IP = process.env.VPS_IP!;
const PLATFORM_BASE_DOMAIN = process.env.PLATFORM_BASE_DOMAIN!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const CERT_PATH = "/etc/letsencrypt/live";
const NGINX_SNIPPETS = "/etc/nginx/snippets";
const CERTBOT_WEBROOT = "/var/www/certbot";

// ===========================
// SAFE HELPERS
// ===========================
function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(cmd))));
  });
}

function validDomain(domain: string): boolean {
  return /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain);
}

async function verifyDNS(domain: string): Promise<boolean> {
  const a = await resolveA(domain).catch(() => [] as string[]);
  const cname = await resolveCname(domain).catch(() => [] as string[]);
  return (
    a.includes(VPS_IP) ||
    cname.some((c) => c.endsWith(PLATFORM_BASE_DOMAIN))
  );
}

// ===========================
// SSL / NGINX
// ===========================
async function issueCert(domain: string) {
  await run("certbot", [
    "certonly",
    "--nginx",
    "--non-interactive",
    "--agree-tos",
    "-m",
    ADMIN_EMAIL,
    "-d",
    domain,
    "-d",
    `www.${domain}`,
  ]);
}

function writeNginxSnippet(domain: string, certDir: string) {
  const fullchain = `${certDir}/fullchain.pem`;
  const privkey = `${certDir}/privkey.pem`;

  if (!fs.existsSync(fullchain) || !fs.existsSync(privkey)) {
    throw new Error("Missing cert files");
  }

  const content = `
server {
  listen 443 ssl http2;
  server_name ${domain} www.${domain};

  ssl_certificate ${fullchain};
  ssl_certificate_key ${privkey};

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
`;

  fs.writeFileSync(`${NGINX_SNIPPETS}/ssl-${domain}.conf`, content);
}

// ===========================
// MAIN
// ===========================
async function main() {
  console.log("🔐 Running SSL domain worker...");

  const companies = await prisma.company.findMany({
    where: { sslStatus: "PENDING", domain: { not: null } },
  });

  for (const c of companies) {
    const domain = c.domain!;

    try {
      if (!validDomain(domain)) {
        throw new Error("Invalid domain format");
      }

      console.log(`🔍 ${domain}`);

      const dnsOk = await verifyDNS(domain);
      if (!dnsOk) {
        throw new Error("DNS not configured");
      }

      await prisma.company.update({
        where: { id: c.id },
        data: { sslStatus: "ISSUING", sslError: null },
      });

      const isWildcard = domain.endsWith(`.${PLATFORM_BASE_DOMAIN}`);
      const certDir = isWildcard
        ? `${CERT_PATH}/${PLATFORM_BASE_DOMAIN}`
        : `${CERT_PATH}/${domain}`;

      if (!isWildcard) {
        if (!fs.existsSync(certDir)) {
          await issueCert(domain);
        }
      }

      writeNginxSnippet(domain, certDir);

      await run("nginx", ["-t"]);
      await run("systemctl", ["reload", "nginx"]);

      await prisma.company.update({
        where: { id: c.id },
        data: { sslStatus: "ACTIVE", hasWebsite: true },
      });

      // console.log(`✅ ${domain} active`);
    } catch (err: any) {
      console.error(`❌ ${domain}:`, err.message);
      await prisma.company.update({
        where: { id: c.id },
        data: { sslStatus: "FAILED", sslError: err.message },
      });
    }
  }

  // console.log("🎉 SSL worker finished");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
// import prisma from "@/server/db/prismadb";
// import { exec } from "child_process";
// import util from "util";
// import dns from "dns";
// import fs from "fs";

// const execPromise = util.promisify(exec);
// const resolvePromise = util.promisify(dns.resolve);
// const resolveCnamePromise = util.promisify(dns.resolveCname);

// // ===========================
// // CONFIG CONSTANTS
// // ===========================
// const VPS_IP = process.env.VPS_IP || "YOUR_SERVER_IP";
// const PLATFORM_BASE_DOMAIN = process.env.PLATFORM_BASE_DOMAIN || "salesmanpro.site";
// const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@salesmanpro.site";
// const USE_STAGING = process.env.USE_STAGING === "true" || false;
// const CERTBOT_BASE_PATH = "/etc/letsencrypt/live";
// const NGINX_SNIPPET_DIR = "/etc/nginx/snippets";

// // ===========================
// // HELPERS
// // ===========================
// async function verifyDNS(domain: string): Promise<boolean> {
//   try {
//     const aRecords = await resolvePromise(domain).catch(() => [] as string[]);
//     const cnameRecords = await resolveCnamePromise(domain).catch(() => [] as string[]);

//     const pointsToIP = aRecords.includes(VPS_IP);
//     const pointsToPlatform =
//       cnameRecords.some((c) => c.endsWith(PLATFORM_BASE_DOMAIN)) || pointsToIP;

//     return pointsToPlatform;
//   } catch {
//     return false;
//   }
// }

// async function removeTempConfig(domain: string) {
//   const tempPath = `/etc/nginx/snippets/temp-${domain}.conf`;
//   if (fs.existsSync(tempPath)) {
//     await execPromise(`sudo rm -f ${tempPath}`);
//     console.log(`🧹 Removed temp config for ${domain}`);
//   }
// }

// async function createTempConfig(domain: string) {
//   console.log(`🔧 Creating temporary HTTP config for ${domain}...`);
//   const tempConfPath = `/etc/nginx/snippets/temp-${domain}.conf`;
//   const tempConf = `
// server {
//     listen 80;
//     listen [::]:80;
//     server_name ${domain} www.${domain};

//     location /.well-known/acme-challenge/ {
//         root /var/www/certbot;
//     }

//     location / {
//         return 301 https://$host$request_uri;
//     }
// }
// `;

//   await execPromise(`echo "${tempConf}" | sudo tee ${tempConfPath} > /dev/null`);
//   await execPromise("sudo nginx -t");
//   await execPromise("sudo systemctl reload nginx");
//   console.log(`✅ Temporary config loaded for ${domain}`);
// }

// async function issueSSL(domain: string) {
//   const stagingFlag = USE_STAGING ? "--staging" : "";
//   console.log(`🔐 Issuing SSL for ${domain}...`);
//   try {
//     await execPromise("sudo mkdir -p /var/www/certbot");

//     await createTempConfig(domain);
//     const cmd = `sudo certbot certonly --nginx ${stagingFlag} -d ${domain} -d www.${domain} --non-interactive --agree-tos -m ${ADMIN_EMAIL}`;
//     const { stdout, stderr } = await execPromise(cmd);
//     if (stdout) console.log(stdout);
//     if (stderr) console.warn(stderr);
//     console.log(`✅ SSL issued for ${domain}`);
//   } catch (err: any) {
//     console.error(`❌ Certbot failed for ${domain}:`, err.message);
//   } finally {
//     await removeTempConfig(domain);
//   }
// }

// async function createNginxSnippet(domain: string, usingWildcard = false) {
//   const certDir = usingWildcard
//     ? `${CERTBOT_BASE_PATH}/${PLATFORM_BASE_DOMAIN}`
//     : `${CERTBOT_BASE_PATH}/${domain}`;

//   const certPath = `${certDir}/fullchain.pem`;
//   const keyPath = `${certDir}/privkey.pem`;

//   if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
//     console.error(`❌ Missing certificate files for ${domain}.`);
//     return;
//   }

//   const snippetPath = `${NGINX_SNIPPET_DIR}/ssl-${domain}.conf`;
//   const snippetContent = `
// # Auto-generated SSL server for ${domain}
// server {
//     listen 443 ssl http2;
//     listen [::]:443 ssl http2;
//     server_name ${domain} www.${domain};

//     ssl_certificate     ${certPath};
//     ssl_certificate_key ${keyPath};

//     ssl_protocols TLSv1.2 TLSv1.3;
//     ssl_ciphers HIGH:!aNULL:!MD5;
//     ssl_prefer_server_ciphers on;

//     location / {
//         proxy_pass http://127.0.0.1:3000;
//         proxy_http_version 1.1;

//         proxy_set_header Upgrade \\$http_upgrade;
//         proxy_set_header Connection "upgrade";
//         proxy_set_header Host \\$host;
//         proxy_set_header X-Real-IP \\$remote_addr;
//         proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
//         proxy_set_header X-Forwarded-Proto \\$scheme;

//         proxy_cache_bypass \\$http_upgrade;
//     }

//     location /.well-known/acme-challenge/ {
//         root /var/www/certbot;
//     }
// }
// `;

//   await execPromise(`echo "${snippetContent}" | sudo tee ${snippetPath} > /dev/null`);
//   await execPromise("sudo nginx -t");
//   await execPromise("sudo systemctl reload nginx");
//   console.log(`✅ Created NGINX snippet and reloaded for ${domain}`);
// }

// // ===========================
// // MAIN JOB
// // ===========================
// async function main() {
//   console.log("🚀 Starting custom domain SSL verification job...");

//   const companies = await prisma.company.findMany({
//     where: { sslStatus: "PENDING", domain: { not: null } },
//     select: { id: true, domain: true },
//   });

//   if (!companies.length) {
//     console.log("No pending SSL domains found.");
//     process.exit(0);
//   }

//   for (const company of companies) {
//     const domain = company.domain!;
//     console.log(`🔍 Checking ${domain}...`);

//     const dnsOk = await verifyDNS(domain);
//     if (!dnsOk) {
//       console.warn(`⚠️ DNS not correctly configured for ${domain}. Skipping.`);
//       continue;
//     }

//     const usingWildcard = domain.endsWith(`.${PLATFORM_BASE_DOMAIN}`);
//     const certDir = usingWildcard
//       ? `${CERTBOT_BASE_PATH}/${PLATFORM_BASE_DOMAIN}`
//       : `${CERTBOT_BASE_PATH}/${domain}`;

//     const certPath = `${certDir}/fullchain.pem`;
//     const keyPath = `${certDir}/privkey.pem`;
//     const certExists = fs.existsSync(certPath) && fs.existsSync(keyPath);

//     if (certExists) {
//       console.log(`✅ SSL already exists for ${domain}.`);
//     } else {
//       if (usingWildcard) {
//         console.log(`🔄 Using existing wildcard SSL for ${domain}`);
//       } else {
//         await issueSSL(domain);
//       }
//     }

//     await createNginxSnippet(domain, usingWildcard);

//     await prisma.company.update({
//       where: { id: company.id },
//       data: { sslStatus: "active", hasWebsite: true },
//     });
//   }

//   console.log("🎉 Custom domain SSL job completed successfully.");
//   process.exit(0);
// }

// main().catch((err) => {
//   console.error("❌ SSL Cron Job Error:", err);
//   process.exit(1);
// });
