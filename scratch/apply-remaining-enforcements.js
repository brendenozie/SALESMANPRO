// scratch/apply-remaining-enforcements.js
const fs = require('fs');
const path = require('path');

function updateFile(filePath, transforms) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  const isCrlf = content.includes('\r\n');
  let normalized = content.replace(/\r\n/g, '\n');
  let changed = false;

  for (const { name, search, replace } of transforms) {
    const searchNorm = typeof search === 'string' ? search.replace(/\r\n/g, '\n') : search;
    const replaceNorm = typeof replace === 'string' ? replace.replace(/\r\n/g, '\n') : replace;

    if (typeof searchNorm === 'string') {
      if (!normalized.includes(searchNorm)) {
        console.error(`[FAIL] ${filePath} - "${name}": search string not found`);
        continue;
      }
      normalized = normalized.replace(searchNorm, replaceNorm);
      changed = true;
      console.log(`[OK] ${filePath} - "${name}"`);
    } else if (searchNorm instanceof RegExp) {
      if (!searchNorm.test(normalized)) {
        console.error(`[FAIL] ${filePath} - "${name}": regex pattern not matched`);
        continue;
      }
      normalized = normalized.replace(searchNorm, replaceNorm);
      changed = true;
      console.log(`[OK] ${filePath} - "${name}"`);
    }
  }

  if (changed) {
    const finalContent = isCrlf ? normalized.replace(/\n/g, '\r\n') : normalized;
    fs.writeFileSync(fullPath, finalContent, 'utf8');
    console.log(`[SAVED] ${filePath}`);
  } else {
    console.log(`[NO CHANGE] ${filePath}`);
  }
}

// 1. Sales agents: reorder companyId check
updateFile('app/api/admin/sales-agents/route.ts', [
  {
    name: 'Reorder companyId validation before enforceSalesAgentLimit',
    search: `    // --- Subscription Plan Enforcement: Sales Agent Limit ---
    const agentCheck = await enforceSalesAgentLimit(companyId);
    if (!agentCheck.allowed) {
      return formatResponse(false, { upgradeRequired: agentCheck.upgradeRequired, currentCount: agentCheck.currentCount, limit: agentCheck.limit }, agentCheck.message, 403);
    }

    if (!name || !email || !phone || !bio || !companyId)
      return formatResponse(
        false,
        null,
        "Missing required fields: name, email, phone, bio, companyId",
        400
      );`,
    replace: `    if (!name || !email || !phone || !bio || !companyId)
      return formatResponse(
        false,
        null,
        "Missing required fields: name, email, phone, bio, companyId",
        400
      );

    // --- Subscription Plan Enforcement: Sales Agent Limit ---
    const agentCheck = await enforceSalesAgentLimit(companyId);
    if (!agentCheck.allowed) {
      return formatResponse(false, { upgradeRequired: agentCheck.upgradeRequired, currentCount: agentCheck.currentCount, limit: agentCheck.limit }, agentCheck.message, 403);
    }`
  }
]);

// 2. Admin Custom Domain: app/api/admin/custom-domain/route.ts
updateFile('app/api/admin/custom-domain/route.ts', [
  {
    name: 'Add domain enforcement before DNS check',
    search: `  const existingDomain = await prisma.company.findFirst({
    where: { domain },
    select: { id: true },
  });

  if (existingDomain) {
    return formatResponse(
      false,
      null,
      "Domain is already connected to another company.",
      409
    );
  }`,
    replace: `  const existingDomain = await prisma.company.findFirst({
    where: { domain },
    select: { id: true },
  });

  if (existingDomain) {
    return formatResponse(
      false,
      null,
      "Domain is already connected to another company.",
      409
    );
  }

  const userCompany = await prisma.company.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!userCompany) {
    return formatResponse(false, null, "Company not found", 404);
  }

  // --- Subscription Plan Enforcement: Custom Domain Gate ---
  const domainCheck = await enforceCustomDomain(userCompany.id);
  if (!domainCheck.allowed) {
    return formatResponse(false, { upgradeRequired: domainCheck.upgradeRequired }, domainCheck.message, 403);
  }`
  }
]);

// 3. Admin Vercel Domain: app/api/admin/custom-domain/vercel/route.ts
updateFile('app/api/admin/custom-domain/vercel/route.ts', [
  {
    name: 'Add domain enforcement in POST',
    search: `  const cleanDomain = parsed.data.domain.trim().toLowerCase();

  try {
    // Prevent duplicate domain usage`,
    replace: `  const cleanDomain = parsed.data.domain.trim().toLowerCase();

  try {
    const userCompany = await prisma.company.findFirst({
      where: { userId: auth.user.id },
      select: { id: true },
    });

    if (!userCompany) {
      return formatResponse(false, null, "Company not found", 404);
    }

    // --- Subscription Plan Enforcement: Custom Domain Gate ---
    const domainCheck = await enforceCustomDomain(userCompany.id);
    if (!domainCheck.allowed) {
      return formatResponse(false, { upgradeRequired: domainCheck.upgradeRequired }, domainCheck.message, 403);
    }

    // Prevent duplicate domain usage`
  }
]);
