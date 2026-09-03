import fs from "fs/promises";
import path from "path";

const DRY_RUN = process.env.DRY_RUN === "true"; // Only dry run when explicitly requested

const KNOWN_PARAMS = [
  "page", "limit", "search", "query", "status", "sortBy", "sortOrder",
  "categoryId", "subCategoryId", "studentId", "assignmentId", "teacherId",
  "courseId", "classId", "type", "date", "startDate", "endDate", "filter",
  "role", "month", "year", "action", "offset"
];

function findFunctionStart(lines, lineIndex) {
  for (let j = lineIndex - 1; j >= 0; j--) {
    const line = lines[j];
    if (/(?:async\s+function|const\s+\w+\s*=\s*(?:with\w+\()?async|export\s+(?:const|async)).*\{/.test(line)) {
      return j;
    }
  }
  return Math.max(0, lineIndex - 30);
}

function findInScopeParams(content, lineIndex, lines) {
  const start = findFunctionStart(lines, lineIndex);
  const precedingText = lines.slice(start, lineIndex).join("\n");
  
  const found = [];
  for (const p of KNOWN_PARAMS) {
    const declRegex = new RegExp(`(?:const|let|var)\\s+(?:\\{[^}]*\\b${p}\\b[^}]*\\}|\\b${p}\\b)\\s*(?::[^=]+)?=`);
    if (declRegex.test(precedingText)) {
      found.push(p);
    }
  }
  return found.sort();
}

function cleanTenantExpr(rawExpr, precedingText) {
  if (!rawExpr || rawExpr === "'global'" || rawExpr === '"global"') {
    if (/\bcompanyId\b/.test(precedingText)) return "companyId";
    if (/\badminSlug\b/.test(precedingText)) return "adminSlug";
    if (/\bslug\b/.test(precedingText)) return "slug";
    return "'unscoped'";
  }

  // Strip || 'global' or || "global"
  let cleaned = rawExpr.replace(/\s*\|\|\s*['"]global['"]/g, "").trim();
  if (cleaned.startsWith("${") && cleaned.endsWith("}")) {
    cleaned = cleaned.slice(2, -1).trim();
  }
  if (!cleaned) return "'unscoped'";
  return cleaned;
}

async function processFile(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split("\n");
  let modified = false;
  const newLines = [];

  // Regex to match naive cacheKey lines (avoiding commented out lines)
  const cacheKeyRegex = /^(\s*)const\s+cacheKey\s*=\s*`admin:([^:`]+)(?::(?:\${([^}]+)}|'([^']+)'|"([^"]+)"))?:all`;?\s*(?:\/\/.*)?$/;
  const cacheKeyQuotesRegex = /^(\s*)const\s+cacheKey\s*=\s*['"]admin:([^:'"]+)(?::([^:'"]+))?:all['"];?\s*(?:\/\/.*)?$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip commented-out lines
    if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")) {
      newLines.push(line);
      continue;
    }

    let match = line.match(cacheKeyRegex);
    if (match) {
      const indent = match[1];
      const resource = match[2];
      const rawTenant = match[3] || match[4] || match[5] || "";
      const precedingText = lines.slice(Math.max(0, i - 40), i).join("\n");
      const tenant = cleanTenantExpr(rawTenant, precedingText);
      const params = findInScopeParams(content, i, lines);

      const paramsStr = params.length > 0 ? `{ ${params.join(", ")} }` : "{}";
      const replacement = `${indent}const cacheKey = buildTenantCacheKey(${tenant}, "${resource}", ${paramsStr});`;
      
      newLines.push(replacement);
      modified = true;
      continue;
    }

    match = line.match(cacheKeyQuotesRegex);
    if (match) {
      const indent = match[1];
      const resource = match[2];
      const rawTenant = match[3] || "";
      const precedingText = lines.slice(Math.max(0, i - 40), i).join("\n");
      const tenant = cleanTenantExpr(rawTenant, precedingText);
      const params = findInScopeParams(content, i, lines);

      const paramsStr = params.length > 0 ? `{ ${params.join(", ")} }` : "{}";
      const replacement = `${indent}const cacheKey = buildTenantCacheKey(${tenant}, "${resource}", ${paramsStr});`;

      newLines.push(replacement);
      modified = true;
      continue;
    }

    // Invalidation replacement: await cacheDel(`admin:...:all`) or `admin:...:*` (with or without try/catch)
    const delRegex = /^(\s*)(?:try\s*\{\s*)?await\s+cacheDel\(`admin:([^:`]+)(?::(?:\${([^}]+)}|'([^']+)'|"([^"]+)"))?:(?:all|\*)`\);?(?:\s*\}\s*catch\s*(?:\([^)]*\))?\s*\{\})?\s*$/;
    const delMatch = line.match(delRegex);
    if (delMatch) {
      const indent = delMatch[1];
      const resource = delMatch[2];
      const rawTenant = delMatch[3] || delMatch[4] || delMatch[5] || "";
      const precedingText = lines.slice(Math.max(0, i - 40), i).join("\n");
      const tenant = cleanTenantExpr(rawTenant, precedingText);

      const hasTryCatch = line.includes("try");
      if (hasTryCatch) {
        newLines.push(`${indent}try {`);
        newLines.push(`${indent}  await cacheDel(\`tenant:\${${tenant}}:${resource}:*\`);`);
        newLines.push(`${indent}  await cacheDel(\`admin:${resource}:*\`);`);
        newLines.push(`${indent}} catch (e) {}`);
      } else {
        newLines.push(`${indent}await cacheDel(\`tenant:\${${tenant}}:${resource}:*\`);`);
        newLines.push(`${indent}await cacheDel(\`admin:${resource}:*\`);`);
      }
      modified = true;
      continue;
    }

    newLines.push(line);
  }

  if (modified) {
    let result = newLines.join("\n");

    // Ensure buildTenantCacheKey is imported at the top of the file
    const importRegex = /^import\s+\{([^}]+)\}\s+from\s+["']@\/lib\/cache["'];?/m;
    const importMatch = result.match(importRegex);
    if (importMatch) {
      const currentImports = importMatch[1].split(",").map(s => s.trim()).filter(Boolean);
      if (!currentImports.includes("buildTenantCacheKey")) {
        currentImports.push("buildTenantCacheKey");
        currentImports.sort();
        const newImport = `import { ${currentImports.join(", ")} } from "@/lib/cache";`;
        result = result.replace(importRegex, newImport);
      }
    }

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would update: ${filePath}`);
    } else {
      await fs.writeFile(filePath, result, "utf8");
      console.log(`[UPDATED] ${filePath}`);
    }
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))) {
      await processFile(fullPath);
    }
  }
}

const target = process.argv[2] || "app/api/admin";
console.log(`Scanning: ${target} (DRY_RUN=${DRY_RUN})`);

async function run() {
  const stat = await fs.stat(target);
  if (stat.isDirectory()) {
    await walk(target);
  } else {
    await processFile(target);
  }
}

run().catch(console.error);