import prisma from "@/server/db/prismadb";
import { spawn } from "child_process";
import fs from "fs";

const CERT_PATH = "/etc/letsencrypt/live";
const NGINX_SNIPPETS = "/etc/nginx/snippets";
const EMAIL = process.env.ADMIN_EMAIL!;
const PLATFORM_DOMAIN = process.env.PLATFORM_BASE_DOMAIN!;

function run(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? resolve() : reject()));
  });
}

async function processCompany(companyId: string, domain: string) {
  await prisma.company.update({
    where: { id: companyId },
    data: { sslStatus: "ISSUING", sslError: null },
  });

  const isWildcard = domain.endsWith(`.${PLATFORM_DOMAIN}`);
  const certDir = isWildcard
    ? `${CERT_PATH}/${PLATFORM_DOMAIN}`
    : `${CERT_PATH}/${domain}`;

  if (!isWildcard) {
    await run("certbot", [
      "certonly",
      "--nginx",
      "--non-interactive",
      "--agree-tos",
      "-m",
      EMAIL,
      "-d",
      domain,
      "-d",
      `www.${domain}`,
    ]);
  }

  if (
    !fs.existsSync(`${certDir}/fullchain.pem`) ||
    !fs.existsSync(`${certDir}/privkey.pem`)
  ) {
    throw new Error("Certificate files missing");
  }

  const snippet = `
server {
  listen 443 ssl http2;
  server_name ${domain} www.${domain};

  ssl_certificate ${certDir}/fullchain.pem;
  ssl_certificate_key ${certDir}/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
  }
}
`;

  fs.writeFileSync(`${NGINX_SNIPPETS}/ssl-${domain}.conf`, snippet);

  await run("nginx", ["-t"]);
  await run("systemctl", ["reload", "nginx"]);

  await prisma.company.update({
    where: { id: companyId },
    data: { sslStatus: "ACTIVE" },
  });
}

async function main() {
  const companies = await prisma.company.findMany({
    where: { sslStatus: "PENDING" },
  });

  for (const c of companies) {
    try {
      await processCompany(c.id, c.domain!);
    } catch (err: any) {
      await prisma.company.update({
        where: { id: c.id },
        data: { sslStatus: "FAILED", sslError: err.message },
      });
    }
  }
}

main().catch(console.error);