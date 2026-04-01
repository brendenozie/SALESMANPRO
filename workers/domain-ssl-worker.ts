import prisma from "../server/db/prismadb";
import { spawn } from "child_process";
import fs from "fs";

const CERT_PATH = "/etc/letsencrypt/live";
const NGINX_SITES = "/etc/nginx/sites-enabled"; // Recommended over snippets for full server blocks
const EMAIL = process.env.ADMIN_EMAIL!;
const PLATFORM_DOMAIN = process.env.PLATFORM_BASE_DOMAIN!;
const CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Helper to run shell commands with sudo
 */
function run(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    // The -n flag for sudo means "non-interactive"
    const p = spawn("sudo", ["-n", cmd, ...args], { stdio: "inherit" });
    p.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(
              `Command ${cmd} failed with code ${code}. Check sudo permissions.`,
            ),
          ),
    );
  });
}

async function processCompany(companyId: string, domain: string) {
  console.log(`🚀 Processing SSL for: ${domain}`);

  const LOCK = "/tmp/certbot.lock";

  if (fs.existsSync(LOCK)) {
    throw new Error("Certbot already running");
  }

  fs.writeFileSync(LOCK, "1");

  try {
    await prisma.company.update({
      where: { id: companyId },
      data: { sslStatus: "ISSUING", sslError: null },
    });

    const isWildcard = domain.endsWith(`.${PLATFORM_DOMAIN}`);
    const certDir = isWildcard
      ? `${CERT_PATH}/${PLATFORM_DOMAIN}`
      : `${CERT_PATH}/${domain}`;

    // 1. Issue Certificate (Skip if it's a subdomain covered by your wildcard)
    if (!isWildcard) {
      await run("certbot", [
        "certonly",
        "--nginx",
        "--non-interactive",
        "--agree-tos",
        "--quiet", // Add this to reduce output noise
        "-m",
        EMAIL,
        "-d",
        domain,
        "-d",
        `www.${domain}`,
      ]);
    }

    try {
      // 2. Verify files exist
      if (
        !fs.existsSync(`${certDir}/fullchain.pem`) ||
        !fs.existsSync(`${certDir}/privkey.pem`)
      ) {
        throw new Error(`Certificate files missing in ${certDir}`);
      }

      // 3. Generate Full Nginx Config (Including Port 80 redirect)
      const config = `
        server {
            listen 80;
            server_name ${domain} www.${domain};
            return 301 https://$host$request_uri;
        }

    server {
        listen 443 ssl http2;
        server_name ${domain} www.${domain};

        ssl_certificate ${certDir}/fullchain.pem;
        ssl_certificate_key ${certDir}/privkey.pem;

        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    `;

      // 4. Write config and reload Nginx
      // Note: If fs.writeFileSync fails due to permissions, use a temporary file + sudo mv
      const tempPath = `/tmp/${domain}.conf`;
      fs.writeFileSync(tempPath, config);
      await run("mv", [tempPath, `${NGINX_SITES}/${domain}.conf`]);

      await run("nginx", ["-t"]);
      await run("systemctl", ["reload", "nginx"]);

      await prisma.company.update({
        where: { id: companyId },
        data: { sslStatus: "ACTIVE" },
      });

      console.log(`✅ SSL Successfully activated for ${domain}`);
    } catch (err: any) {
      // await prisma.company.update({
      //   where: { id: companyId },
      //   data: {
      //     sslStatus: "PENDING",
      //     sslError: err.message,
      //   },
      // });
      throw err;
    }
  } finally {
    fs.unlinkSync(LOCK);
  }
}

async function worker() {
  try {
    console.log("🛠️ SSL Worker is running...");
    const company = await prisma.company.findFirst({
      where: { sslStatus: "PENDING" },
    });

    if (company && company.domain) {
      await processCompany(company.id, company.domain);
    }
  } catch (err) {
    console.error("Worker Error:", err);
  } finally {
    // 1. Force Global Garbage Collection (optional but helpful)
    // 2. Wait 30 seconds before the NEXT run instead of a tight while loop
    setTimeout(worker, 30000);
  }
}

// Start the persistent loop
worker().catch(console.error);
