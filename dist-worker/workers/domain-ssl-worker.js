"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismadb_1 = __importDefault(require("../server/db/prismadb"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const CERT_PATH = "/etc/letsencrypt/live";
// const NGINX_SITES = "/etc/nginx/sites-enabled";
const TENANT_AVAILABLE = "/etc/nginx/sites-available/tenants";
const TENANT_ENABLED = "/etc/nginx/sites-enabled";
const EMAIL = process.env.ADMIN_EMAIL;
const PLATFORM_DOMAIN = process.env.PLATFORM_BASE_DOMAIN;
/**
 * Helper to run shell commands with sudo in non-interactive mode.
 * Captures stderr for better debugging of permission/network issues.
 */
function run(cmd, args) {
    return new Promise((resolve, reject) => {
        const p = (0, child_process_1.spawn)("sudo", ["-n", cmd, ...args]);
        let stderr = "";
        p.stderr.on("data", (data) => {
            stderr += data.toString();
        });
        p.on("exit", (code) => {
            if (code === 0)
                resolve("Success");
            else
                reject(new Error(`Command ${cmd} failed (Code ${code}): ${stderr.trim()}`));
        });
    });
}
/**
 * Uses the shell 'test' command via sudo to check for file existence.
 * This bypasses Node.js permission restrictions on /etc/letsencrypt.
 */
async function fileExistsSudo(path) {
    try {
        await run("test", ["-f", path]);
        return true;
    }
    catch {
        return false;
    }
}
async function processCompany(companyId, domain) {
    console.log(`🚀 Processing SSL for: ${domain}`);
    const LOCK = "/tmp/certbot.lock";
    if (fs_1.default.existsSync(LOCK)) {
        throw new Error("Certbot is currently locked by another process.");
    }
    fs_1.default.writeFileSync(LOCK, "1");
    try {
        await prismadb_1.default.company.update({
            where: { id: companyId },
            data: { sslStatus: "ISSUING", sslError: null },
        });
        const isWildcard = domain.endsWith(`.${PLATFORM_DOMAIN}`);
        const certDir = isWildcard
            ? `${CERT_PATH}/${PLATFORM_DOMAIN}`
            : `${CERT_PATH}/${domain}`;
        // 1. Check for existing certificate to avoid Let's Encrypt connection errors
        const hasFullChain = await fileExistsSudo(`${certDir}/fullchain.pem`);
        const hasPrivKey = await fileExistsSudo(`${certDir}/privkey.pem`);
        if (!isWildcard && (!hasFullChain || !hasPrivKey)) {
            console.log(`📡 Requesting new certificate for ${domain}...`);
            await run("certbot", [
                "certonly",
                "--nginx",
                "--non-interactive",
                "--agree-tos",
                "--cert-name",
                domain,
                "--quiet",
                "-m",
                EMAIL,
                "-d",
                domain,
                "-d",
                `www.${domain}`,
            ]);
        }
        else {
            console.log(`✨ Valid certificate files found for ${domain}. Skipping issuance.`);
        }
        // 2. Double-verify accessibility before writing Nginx config
        if (!(await fileExistsSudo(`${certDir}/fullchain.pem`))) {
            throw new Error(`Critical: Certificate files inaccessible in ${certDir}`);
        }
        // 3. Generate Nginx Configuration
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
        // 4. Atomic Write: Write to tmp then move with sudo to avoid permission issues
        const availablePath = `${TENANT_AVAILABLE}/${domain}.conf`;
        const tenantEnabledPath = `${TENANT_ENABLED}/${domain}.conf`;
        const tempPath = `/tmp/${domain}.conf`;
        fs_1.default.writeFileSync(tempPath, config);
        await run("mv", [tempPath, `${availablePath}/${domain}.conf`]);
        // Create symlink only if missing
        await run("ln", ["-sfn", availablePath, tenantEnabledPath]);
        // 5. Reload Nginx
        await run("nginx", ["-t"]);
        await run("systemctl", ["reload", "nginx"]);
        await prismadb_1.default.company.update({
            where: { id: companyId },
            data: { sslStatus: "ACTIVE", sslError: null },
        });
        console.log(`✅ SSL Successfully activated for ${domain}`);
    }
    catch (err) {
        console.error(`❌ Process Failed for ${domain}:`, err.message);
        await prismadb_1.default.company.update({
            where: { id: companyId },
            data: {
                sslStatus: "ERROR",
                sslError: err.message,
            },
        });
        throw err;
    }
    finally {
        if (fs_1.default.existsSync(LOCK))
            fs_1.default.unlinkSync(LOCK);
    }
}
async function worker() {
    try {
        console.log("🛠️ Checking for PENDING SSL tasks...");
        const company = await prismadb_1.default.company.findFirst({
            where: { sslStatus: "PENDING" },
        });
        if (company && company.domain) {
            await processCompany(company.id, company.domain);
        }
    }
    catch (err) {
        // Error logged in processCompany, worker continues loop
    }
    finally {
        setTimeout(worker, 30000);
    }
}
// Start the persistent loop
worker().catch(console.error);