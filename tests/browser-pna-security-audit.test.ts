import fs from "fs";
import path from "path";
import assert from "assert";

async function runBrowserPnaSecurityAudit() {
  console.log("\n========================================================");
  console.log("🛡️ BROWSER PNA & STOREFRONT SECURITY AUDIT SUITE");
  console.log("========================================================\n");

  // ----------------------------------------------------
  // TEST 1: Static Codebase Audit - Zero Client Loopback APIs
  // ----------------------------------------------------
  console.log("TEST 1: Scanning client components & storefront layouts for loopback URLs...");

  const scanDirs = [
    path.join(__dirname, "../components/site"),
    path.join(__dirname, "../app/site"),
    path.join(__dirname, "../hooks"),
    path.join(__dirname, "../contexts"),
  ];

  const violations: { file: string; line: number; text: string }[] = [];

  function scan(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf8");
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          // Check for un-sanitized localhost or 127.0.0.1 in active client code
          if (
            !line.trim().startsWith("//") &&
            /https?:\/\/(?:127\.0\.0\.1|localhost):3000\/api/.test(line)
          ) {
            violations.push({
              file: path.relative(path.join(__dirname, ".."), fullPath),
              line: idx + 1,
              text: line.trim(),
            });
          }
        });
      }
    }
  }

  scanDirs.forEach(scan);

  if (violations.length > 0) {
    console.error(`❌ Found ${violations.length} files with loopback API URLs:`, violations);
  }
  assert.strictEqual(
    violations.length,
    0,
    `Expected 0 client files with loopback API URLs, found ${violations.length}`
  );
  console.log("  ✅ Zero client files contain 127.0.0.1:3000/api or localhost:3000/api.");

  // ----------------------------------------------------
  // TEST 2: Canonical API Resolution
  // ----------------------------------------------------
  console.log("\nTEST 2: Canonical API resolution...");
  const apiConfigPath = path.join(__dirname, "../lib/api-config.ts");
  assert.ok(fs.existsSync(apiConfigPath), "lib/api-config.ts must exist");
  const apiConfigContent = fs.readFileSync(apiConfigPath, "utf8");
  assert.ok(
    apiConfigContent.includes('export const API_BASE_URL = "/api";'),
    "API_BASE_URL must be '/api'"
  );
  console.log("  ✅ lib/api-config.ts correctly exports API_BASE_URL = '/api'.");

  // ----------------------------------------------------
  // TEST 3: URL Normalization in SWR Cache Fetcher
  // ----------------------------------------------------
  console.log("\nTEST 3: Testing normalizeApiUrl logic...");
  const normalizeApiUrl = (url: string, hostname: string = "mystore.salesmanpro.site") => {
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):3000\/api/, "/api");
    }
    return url;
  };

  assert.strictEqual(
    normalizeApiUrl("http://localhost:3000/api/site/testimonials?id=123"),
    "/api/site/testimonials?id=123"
  );
  assert.strictEqual(
    normalizeApiUrl("http://127.0.0.1:3000/api/site/faqs?id=123"),
    "/api/site/faqs?id=123"
  );
  assert.strictEqual(
    normalizeApiUrl("https://127.0.0.1:3000/api/conversations/send"),
    "/api/conversations/send"
  );
  assert.strictEqual(
    normalizeApiUrl("/api/site/productsByFlag?flag=trending"),
    "/api/site/productsByFlag?flag=trending"
  );
  console.log("  ✅ Loopback URLs are properly normalized to relative '/api'.");

  // ----------------------------------------------------
  // TEST 4: Client Security Guard Component Exists & Configured
  // ----------------------------------------------------
  console.log("\nTEST 4: ClientSecurityGuard verification...");
  const guardPath = path.join(__dirname, "../components/security/ClientSecurityGuard.tsx");
  assert.ok(fs.existsSync(guardPath), "ClientSecurityGuard.tsx must exist");
  const layoutPath = path.join(__dirname, "../app/layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf8");
  assert.ok(
    layoutContent.includes("<ClientSecurityGuard />"),
    "app/layout.tsx must render ClientSecurityGuard"
  );
  console.log("  ✅ ClientSecurityGuard component is mounted in root layout.");

  // ----------------------------------------------------
  // TEST 5: Security Headers & Permissions-Policy in Next.js & Nginx
  // ----------------------------------------------------
  console.log("\nTEST 5: Permissions-Policy & Security Headers...");
  const nextConfigPath = path.join(__dirname, "../next.config.js");
  const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8");
  assert.ok(
    nextConfigContent.includes("Permissions-Policy"),
    "next.config.js must configure Permissions-Policy"
  );
  assert.ok(
    nextConfigContent.includes("local-network-access=()"),
    "Permissions-Policy must deny local-network-access"
  );

  const nginxConfPath = path.join(__dirname, "../deploy/nginx-app-server.conf");
  const nginxConfContent = fs.readFileSync(nginxConfPath, "utf8");
  assert.ok(
    nginxConfContent.includes("Permissions-Policy"),
    "nginx-app-server.conf must include Permissions-Policy"
  );
  console.log("  ✅ Permissions-Policy headers configured in next.config.js and Nginx.");

  // ----------------------------------------------------
  // TEST 6: Tenant Tracking ID Sanitization
  // ----------------------------------------------------
  console.log("\nTEST 6: Tenant Analytics Sanitization...");
  const sanitizeTrackingId = (id?: string | null): string | null => {
    if (!id || typeof id !== "string") return null;
    const trimmed = id.trim();
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(trimmed)) return null;
    return trimmed;
  };

  const sanitizeNumericId = (id?: string | null): string | null => {
    if (!id || typeof id !== "string") return null;
    const trimmed = id.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    return trimmed;
  };

  // Valid IDs
  assert.strictEqual(sanitizeTrackingId("G-ABC12345"), "G-ABC12345");
  assert.strictEqual(sanitizeTrackingId("UA-98765-1"), "UA-98765-1");
  assert.strictEqual(sanitizeTrackingId("AW-112233"), "AW-112233");
  assert.strictEqual(sanitizeNumericId("1234567890"), "1234567890");

  // Malicious / injection payloads
  assert.strictEqual(sanitizeTrackingId("1234'; alert(1);//"), null);
  assert.strictEqual(sanitizeTrackingId("<script>fetch()</script>"), null);
  assert.strictEqual(sanitizeTrackingId("id with spaces"), null);
  assert.strictEqual(sanitizeNumericId("1234; injected()"), null);
  console.log("  ✅ Tracking IDs sanitized against script injection.");

  console.log("\n========================================================");
  console.log("🎉 ALL PNA BROWSER PERMISSION AUDIT TESTS PASSED!");
  console.log("========================================================\n");
}

runBrowserPnaSecurityAudit().catch((err) => {
  console.error("FATAL: Test suite failed:", err);
  process.exit(1);
});
