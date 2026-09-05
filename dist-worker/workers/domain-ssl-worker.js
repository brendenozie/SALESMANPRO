"use strict";
/**
 * workers/domain-ssl-worker.ts
 *
 * SalesmanPro Domain SSL Provisioning & Renewal Worker.
 *
 * Single-Server Operational, Multi-Server Compatible:
 * - Uses distributed locking (`lib/lock/distributed-lock.ts`) instead of local `/tmp/certbot.lock`.
 * - Manages Let's Encrypt certificates and local Nginx configuration safely.
 * - Updates authoritative state in MongoDB (`Company.sslStatus`, `Company.sslError`).
 * - Instantly purges the shared Redis domain cache upon activation.
 * - Includes automated certificate renewal checking for certificates nearing expiry.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCompanySSL = void 0;
require("./resolve-alias");
const prismadb_1 = __importDefault(require("../server/db/prismadb"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const distributed_lock_1 = require("../lib/lock/distributed-lock");
const resolver_1 = require("../lib/tenant/resolver");
const CERT_PATH = process.env.CERTBOT_BASE_PATH || "/etc/letsencrypt/live";
const TENANT_AVAILABLE = "/etc/nginx/sites-available";
const TENANT_ENABLED = "/etc/nginx/sites-enabled";
const EMAIL = process.env.ADMIN_EMAIL || "admin@salesmanpro.site";
const PLATFORM_DOMAIN = (process.env.PLATFORM_BASE_DOMAIN || "salesmanpro.site").toLowerCase();
const CHECK_INTERVAL_MS = 30_000; // 30 seconds
let isRunning = true;
/**
 * Helper to run shell commands with sudo in non-interactive mode.
 */
function run(cmd, args) {
    return new Promise((resolve, reject) => {
        const p = (0, child_process_1.spawn)("sudo", ["-n", cmd, ...args]);
        let stderr = "";
        let stdout = "";
        p.stdout?.on("data", (data) => {
            stdout += data.toString();
        });
        p.stderr?.on("data", (data) => {
            stderr += data.toString();
        });
        p.on("exit", (code) => {
            if (code === 0)
                resolve(stdout.trim());
            else
                reject(new Error(`Command ${cmd} failed (Code ${code}): ${stderr.trim()}`));
        });
        p.on("error", (err) => {
            reject(err);
        });
    });
}
/**
 * Uses shell 'test' command via sudo to verify file existence.
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
/**
 * Processes SSL issuance for a single company domain.
 */
async function processCompanySSL(companyId, rawDomain) {
    const domain = rawDomain.trim().toLowerCase().replace(/^www\./, "");
    console.log(`🚀 [DomainSSLWorker] Processing SSL for: ${domain} (Company: ${companyId})`);
    // Acquire distributed lock for this specific domain (3 minute lease)
    const lock = await (0, distributed_lock_1.acquireLock)(`ssl_issue:${domain}`, 180);
    if (!lock) {
        console.log(`⏳ [DomainSSLWorker] Domain ${domain} is currently locked by another worker. Skipping.`);
        return;
    }
    try {
        // 1. Mark state as ISSUING in database
        await prismadb_1.default.company.update({
            where: { id: companyId },
            data: { sslStatus: "ISSUING", sslError: null },
        });
        const isWildcard = domain.endsWith(`.${PLATFORM_DOMAIN}`);
        const certDir = isWildcard
            ? `${CERT_PATH}/${PLATFORM_DOMAIN}`
            : `${CERT_PATH}/${domain}`;
        // 2. Check for existing certificate files
        const hasFullChain = await fileExistsSudo(`${certDir}/fullchain.pem`);
        const hasPrivKey = await fileExistsSudo(`${certDir}/privkey.pem`);
        if (!isWildcard && (!hasFullChain || !hasPrivKey)) {
            console.log(`📡 [DomainSSLWorker] Requesting new Let's Encrypt certificate for ${domain}...`);
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
            console.log(`✨ [DomainSSLWorker] Valid certificate found for ${domain}. Skipping issuance.`);
        }
        // 3. Double-verify certificate accessibility
        const certVerified = await fileExistsSudo(`${certDir}/fullchain.pem`);
        if (!certVerified) {
            throw new Error(`Critical: Certificate files inaccessible in ${certDir}`);
        }
        // 4. Generate local Nginx Server Block (Operational on current server)
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
        proxy_set_header X-Forwarded-Host $host;
    }
}
`;
        const availablePath = `${TENANT_AVAILABLE}/${domain}.conf`;
        const tenantEnabledPath = `${TENANT_ENABLED}/${domain}.conf`;
        const tempPath = `/tmp/${domain}.conf`;
        fs_1.default.writeFileSync(tempPath, config.trim());
        await run("mv", [tempPath, availablePath]);
        await run("ln", ["-sfn", availablePath, tenantEnabledPath]);
        // 5. Test and reload Nginx
        await run("nginx", ["-t"]);
        await run("systemctl", ["reload", "nginx"]);
        // 6. Authoritatively update MongoDB state
        await prismadb_1.default.company.update({
            where: { id: companyId },
            data: {
                sslStatus: "ACTIVE",
                sslError: null,
                domainVerified: true,
            },
        });
        // 7. Cluster-wide cache invalidation
        await (0, resolver_1.invalidateTenantDomainCache)({
            domain,
            companyId,
        });
        console.log(`✅ [DomainSSLWorker] SSL successfully activated and cached for ${domain}`);
    }
    catch (err) {
        console.error(`❌ [DomainSSLWorker] Failed for ${domain}:`, err.message);
        await prismadb_1.default.company.update({
            where: { id: companyId },
            data: {
                sslStatus: "ERROR",
                sslError: err.message,
            },
        }).catch(() => { });
        throw err;
    }
    finally {
        await (0, distributed_lock_1.releaseLock)(lock);
    }
}
exports.processCompanySSL = processCompanySSL;
/**
 * Checks for certificate renewals for active domains.
 * Let's Encrypt certificates are valid for 90 days; renew when within 30 days.
 */
async function checkRenewals() {
    const lock = await (0, distributed_lock_1.acquireLock)("ssl_renewal_check", 300);
    if (!lock)
        return;
    try {
        console.log("🔍 [DomainSSLWorker] Checking for certificate renewals...");
        // Run certbot renew dry-run or quiet renew
        await run("certbot", ["renew", "--quiet", "--no-random-sleep-on-renew"]);
    }
    catch (err) {
        console.warn("⚠️ [DomainSSLWorker] Renewal check notice:", err.message);
    }
    finally {
        await (0, distributed_lock_1.releaseLock)(lock);
    }
}
/**
 * Main worker loop.
 */
async function workerLoop() {
    while (isRunning) {
        try {
            // Find pending domain requests
            const pendingCompany = await prismadb_1.default.company.findFirst({
                where: {
                    sslStatus: { in: ["PENDING", "VERIFIED"] },
                    domain: { not: null },
                },
                select: { id: true, domain: true },
            });
            if (pendingCompany && pendingCompany.domain) {
                await processCompanySSL(pendingCompany.id, pendingCompany.domain).catch(() => { });
            }
        }
        catch (err) {
            console.error("❌ [DomainSSLWorker] Loop error:", err.message);
        }
        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL_MS));
    }
}
// Graceful shutdown handling
const shutdown = () => {
    console.log("\n🛑 [DomainSSLWorker] Shutting down gracefully...");
    isRunning = false;
    setTimeout(() => process.exit(0), 1000);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
// Launch worker
if (require.main === module) {
    console.log("🚀 [DomainSSLWorker] Started SalesmanPro Domain SSL Worker.");
    workerLoop().catch(console.error);
    // Run renewal check every 12 hours
    setInterval(checkRenewals, 12 * 60 * 60 * 1000);
}
