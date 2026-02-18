import fs from "fs/promises";
import path from "path";

const CACHE_IMPORT = `import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";`;
const DRY_RUN = process.env.DRY_RUN === "true";

/**
 * Helper to find the balancing closing brace for a code block.
 */
function findBlockEnd(content, startIndex) {
  let openBraces = 0;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') openBraces++;
    if (content[i] === '}') {
      openBraces--;
      if (openBraces === 0) return i;
    }
  }
  return -1;
}

/**
 * Finds the actual function body string and its range for a given handler.
 * Handles:
 * 1. export const GET = withApiHandler(async (req) => { ... })
 * 2. async function handleGet(...) { ... } ... export const GET = withApiHandler(handleGet)
 * 3. export async function GET(...) { ... }
 */
function findHandlerBody(content, method) {
  // 1. Try Inline Pattern (export const GET = ... => { ... })
  const inlineRegex = new RegExp(`export\\s+const\\s+${method}\\s*=\\s*(?:with\\w+\\()?\\s*async\\s*\\([^)]*\\)\\s*=>\\s*\\{`, 's');
  let match = content.match(inlineRegex);
  
  if (match) {
    const start = match.index + match[0].length - 1; // pointing to {
    const end = findBlockEnd(content, start);
    return { start, end, type: 'inline', name: method };
  }

  // 2. Try Direct Export Pattern (export async function GET(...) { ... })
  const directRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*\\{`, 's');
  match = content.match(directRegex);

  if (match) {
    const start = match.index + match[0].length - 1; // pointing to {
    const end = findBlockEnd(content, start);
    return { start, end, type: 'direct', name: method };
  }

  // 3. Try Named Handler Pattern (export const GET = withApiHandler(handleGet))
  const namedRefRegex = new RegExp(`export\\s+const\\s+${method}\\s*=\\s*with\\w+\\(\\s*([\\w\\d]+)\\s*\\)`, 's');
  match = content.match(namedRefRegex);
  
  if (match) {
    const funcName = match[1];
    // Find the function definition
    const funcDefRegex = new RegExp(`(?:async\\s+function\\s+${funcName}|const\\s+${funcName}\\s*=\\s*async)\\s*\\([^)]*\\)\\s*(?:=>)?\\s*\\{`, 's');
    const funcMatch = content.match(funcDefRegex);
    
    if (funcMatch) {
      const start = funcMatch.index + funcMatch[0].length - 1; // pointing to {
      const end = findBlockEnd(content, start);
      return { start, end, type: 'named', name: funcName };
    }
  }

  return null;
}

/**
 * Logic to optimize GET handlers
 */
function optimizeGet(body, resourceName) {
  if (body.includes("cacheGet")) return body;

  // 1. Identify Data Fetching Statement
  // We look for the exact line where the heavy lifting happens.
  const fetchRegex = /((?:const|let)\s+(\w+|\[[^\]]+\]|\{[^}]+\})\s*=\s*await\s+(?:prisma\.\w+\.(?:findMany|findUnique|count)|Promise\.all|prisma\.\$transaction)[^;]*;)/;
  const match = body.match(fetchRegex);

  if (!match) return body;

  const fullFetchLine = match[0];
  const variableDecl = match[2];
  
  // Extract variable name (simple or destructuring)
  let dataVar = variableDecl;
  if (variableDecl.startsWith('[') || variableDecl.startsWith('{')) {
    // simplified assumption: usually the first var is the data for Promise.all, or destructuring
    const inner = variableDecl.replace(/[\[\]\{\}]/g, '').split(',')[0].trim();
    dataVar = inner; 
  }

  // 2. Determine Scope Variables for Cache Key based on what is USED in the function
  let companyIdExpr = "'global'";
  if (body.includes("companyId")) companyIdExpr = "companyId";
  else if (body.includes("context.user.companyId")) companyIdExpr = "context.user.companyId";
  else if (body.includes("slug")) companyIdExpr = "slug || adminSlug || 'global'";
  else if (body.includes("adminSlug")) companyIdExpr = "adminSlug";

  const cacheKeyLine = `  const cacheKey = \`admin:${resourceName}:\${${companyIdExpr} || 'global'}:all\`;`;
  
  // 3. Inject cacheGet BEFORE the fetch
  const cacheGetBlock = `
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}`;

  // 4. Inject cacheSet AFTER the fetch
  // This ensures we have the data variable defined
  const cacheSetBlock = `
  try {
    if (${dataVar}) {
      await cacheSet(cacheKey, ${dataVar}, 60);
    }
  } catch (e) {}`;

  // Replace the fetch line with the sandwich: Key -> Get -> Fetch -> Set
  const newBlock = `
  ${cacheKeyLine}
${cacheGetBlock}
  ${fullFetchLine}
${cacheSetBlock}`;
  
  return body.replace(fullFetchLine, newBlock);
}

/**
 * Logic to optimize Mutation handlers
 */
function optimizeMutation(body, resourceName) {
  if (body.includes("cacheDel")) return body;
  
  // Check if it's a mutation
  if (!/prisma\.\w+\.(create|update|delete|upsert)/.test(body)) return body;

  let companyIdExpr = "'global'";
  if (body.includes("companyId")) companyIdExpr = "companyId";
  else if (body.includes("userCompanyId")) companyIdExpr = "userCompanyId";
  else if (body.includes("context.user.companyId")) companyIdExpr = "context.user.companyId";
  else if (body.includes("slug")) companyIdExpr = "slug || adminSlug || 'global'";

  const invKey = `\`admin:${resourceName}:\${${companyIdExpr} || 'global'}:*\``;
  const cacheDelBlock = `\n    try { await cacheDel(${invKey}); } catch (e) {}`;

  // Strategy: Find the successful return.
  // We look for returns that are NOT inside a catch block or explicitly returning false/error.
  // A simple heuristic is finding "return formatResponse(true" or "return NextResponse.json"
  
  const successReturnRegex = /(return\s+(?:formatResponse|NextResponse\.json|Response\.json)\s*\(\s*(?:true|.*20[014]|.*success:\s*true))/;
  
  if (successReturnRegex.test(body)) {
    return body.replace(successReturnRegex, (match) => `${cacheDelBlock}\n    ${match}`);
  }
  
  // Fallback: If we have a variable return like "return response;", find where response is defined or just inject before last return
  const genericReturn = /return\s+\w+;/g;
  const matches = [...body.matchAll(genericReturn)];
  if (matches.length > 0) {
      // Use the last return as a fallback if no explicit success pattern found
      const lastMatch = matches[matches.length - 1];
      return body.substring(0, lastMatch.index) + cacheDelBlock + "\n    " + body.substring(lastMatch.index);
  }

  return body;
}

async function optimizeFile(filePath) {
  try {
    let content = await fs.readFile(filePath, "utf8");
    
    // --- NEW: Remove large commented-out blocks before processing ---
    // This targets blocks that start with // import ... and end with }); which is common for commented out route handlers
    content = content.replace(/\/\/ import prisma[\s\S]*?withApiHandler[\s\S]*?\}\);?/g, ''); 
    // Also remove generic large commented blocks that might look like code
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    const originalContent = content;

    // Infer resource name from folder structure
    const pathParts = filePath.split(path.sep);
    const parent = pathParts[pathParts.length - 3];
    const folder = pathParts[pathParts.length - 2];
    const resourceName = folder.startsWith('[') ? parent : folder;

    if (!content.includes("@/lib/cache")) {
      content = CACHE_IMPORT + "\n" + content;
    }

    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

    for (const method of methods) {
      // 1. Find the body range
      const handler = findHandlerBody(content, method);
      if (!handler) continue;

      // 2. Extract the body text (excluding outer braces)
      const bodyContent = content.substring(handler.start + 1, handler.end);

      let newBody = bodyContent;
      if (method === "GET") {
        newBody = optimizeGet(bodyContent, resourceName);
      } else {
        newBody = optimizeMutation(bodyContent, resourceName);
      }

      // 3. Replace if changed
      if (newBody !== bodyContent) {
        content = content.substring(0, handler.start + 1) + newBody + content.substring(handler.end);
      }
    }

    if (content !== originalContent) {
      if (DRY_RUN) {
        console.log(`[DRY RUN] Optimized ${filePath}`);
      } else {
        await fs.writeFile(filePath, content);
        console.log(`✅ Optimized ${filePath}`);
      }
    } else {
      console.log(`ℹ️ Skipped ${filePath}`);
    }

  } catch (e) {
    console.error(`❌ Error ${filePath}:`, e);
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.name === "route.ts") {
      await optimizeFile(fullPath);
    }
  }
}

const target = process.argv[2];
if (target) {
  fs.stat(target).then(s => s.isDirectory() ? walk(target) : optimizeFile(target));
}