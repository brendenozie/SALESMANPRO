import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const CACHE_IMPORT = `import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";\n`;
const DRY_RUN = process.env.DRY_RUN === "true";

const execAsync = promisify(exec);

/* -------------------------------------------------------
   Utilities
------------------------------------------------------- */

async function backupFile(filePath, content) {
  const backupPath = `${filePath}.bak`;
  await fs.writeFile(backupPath, content);
}

async function verifySyntax(filePath) {
  try {
    // We run tsc on the file, but we use a filter to ignore path alias errors (TS2307)
    await execAsync(
      `npx tsc ${filePath} --noEmit --skipLibCheck --target esnext --moduleResolution node --isolatedModules`
    );
    return { success: true };
  } catch (error) {
    const output = error.stdout || error.message;
    
    // Filter out TS2307 (Cannot find module) errors. 
    // If there are other errors (like brackets missing), it will still fail.
    const lines = output.split("\n");
    const realErrors = lines.filter(
      (line) => line.includes("error TS") && !line.includes("TS2307")
    );

    if (realErrors.length === 0) {
      return { success: true };
    }
    return { success: false, error: output };
  }
}

/* -------------------------------------------------------
   Core Optimizer
------------------------------------------------------- */

async function optimizeFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    let content = await fs.readFile(absolutePath, "utf8");
    const originalContent = content;

    // Dynamic Resource Detection
    // e.g., /api/academic-levels/route.ts -> academic-levels
    const pathParts = absolutePath.split(path.sep);
    const folderName = pathParts[pathParts.length - 2];
    const parentFolderName = pathParts[pathParts.length - 3];
    const resourceName = folderName.startsWith("[") ? parentFolderName : folderName;
    const isDetailRoute = folderName.startsWith("[");

    content = content.replace(/\xA0/g, " ");

    if (!content.includes("@/lib/cache")) {
      content = CACHE_IMPORT + content;
    }

    /* -------------------------------
        GET handler optimization
    ------------------------------- */
    // FIXED: Now uses (with\w+) to dynamically capture wrapper like withAuthAndRateLimit
    const getRegex = /(export\s+const\s+GET\s*=\s*(with\w+)\s*\(\s*async\s*\(([^)]*)\)\s*=>\s*\{)([\s\S]*?)(\n\}\s*\)\s*;?)/g;

    content = content.replace(getRegex, (match, header, wrapperName, args, body, footer) => {
      if (body.includes("cacheGet")) return match;

      let updatedArgs = args.trim();
      if (!updatedArgs.includes("context")) {
        updatedArgs = updatedArgs ? `${updatedArgs}, context` : "request, context";
      }

      const prismaReadRegex = /(const\s+(\w+)\s*=\s*await\s+prisma\.\w+\.(findMany|findUnique|findFirst|count)\s*\([\s\S]*?\}\s*\)\s*;?)/s;
      const pMatch = body.match(prismaReadRegex);
      
      if (!pMatch) return match;

      const [fullPrismaCall, , dataVar] = pMatch;
      
      const idPart = isDetailRoute ? ":${id}" : "";
      const hasCompanyId = body.includes("companyId");
      const companyPart = hasCompanyId ? "${companyId}" : "global";

      const injectedGet = `
  const user = context?.user ?? null;
  ${isDetailRoute ? 'const { id } = context.params;' : ''}
  const cacheKey = \`admin:${resourceName}${idPart}:${companyPart}:\${user?.role || "anon"}\`;
  try {
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) return formatResponse(true, cachedData, "Fetched (Cached)", 200);
  } catch (e) {}

  ${fullPrismaCall}

  if (${dataVar}) {
    try { await cacheSet(cacheKey, ${dataVar}, 60); } catch (e) {}
  }
`;
      const newBody = body.replace(fullPrismaCall, injectedGet);
      // FIXED: Uses the dynamically captured wrapperName instead of hardcoding withApiHandler
      return `export const GET = ${wrapperName}(async (${updatedArgs}) => {${newBody}${footer}`;
    });

    /* -------------------------------
        Mutation invalidation
    ------------------------------- */
    // FIXED: Changed withApiHandler to with\w+ to catch withAuthAndRateLimit
    const mutationRegex = /(export\s+const\s+(POST|PUT|PATCH|DELETE)\s*=\s*with\w+\s*\(\s*async\s*\(([^)]*)\)\s*=>\s*\{)([\s\S]+?)(\n\}\s*\)\s*;?)/g;

    content = content.replace(mutationRegex, (match, header, method, args, body, footer) => {
      if (body.includes("cacheDel")) return match;

      if (!/prisma\.\w+\.(create|update|delete|upsert|updateMany|deleteMany)/.test(body)) return match;

      const hasCompanyId = body.includes("companyId");
      const invKey = hasCompanyId
        ? `\`admin:${resourceName}:\${companyId}:*\``
        : `\`admin:${resourceName}:*\``;

      const successReturnRegex = /return\s+formatResponse\s*\(\s*true\s*,/g;
      if (!successReturnRegex.test(body)) return match;

      const newBody = body.replace(successReturnRegex, () => {
        return `
    try { await cacheDel(${invKey}); } catch (e) {}
    return formatResponse(true,`;
      });

      return `${header}${newBody}${footer}`;
    });

    // 3. Save
    if (content !== originalContent) {
      if (DRY_RUN) {
        console.log(`--- DRY RUN: ${filePath} ---`);
        console.log(content);
      } else {
        // await backupFile(absolutePath, originalContent);
        await fs.writeFile(absolutePath, content);

        // const check = await verifySyntax(absolutePath);
        // if (!check.success) {
        //   console.error(`❌ REAL Syntax error in ${filePath}, rolling back.`);
        //   console.error(check.error);
        //   await fs.writeFile(absolutePath, originalContent);
        // } else {
        //   console.log(`✅ OPTIMIZED: ${resourceName} (${isDetailRoute ? 'Detail' : 'List'})`);
        // }
      }
    } else {
      console.log(`ℹ️ NO CHANGES: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ ERROR in ${filePath}:`, error.message);
  }
}

/* -------------------------------------------------------
   Directory Walker & Runner
------------------------------------------------------- */

async function walk(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      await walk(res);
    } else if (file.name === "route.ts" || file.name === "route.js") {
      await optimizeFile(res);
    }
  }
}

const target = process.argv[2];
if (!target) {
  console.log("Usage: node optimize-routes.mjs <path>");
} else {
  fs.stat(target).then(s => s.isDirectory() ? walk(target) : optimizeFile(target));
}