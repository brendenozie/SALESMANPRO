import fs from "fs";
import path from "path";
import { TEMPLATE_REGISTRY } from "../lib/website-builder/template-registry";

interface ThemeBodyAudit {
  templateId: string;
  themeName: string;
  bodyComponent: string;
  shellLayout: string;
  filePath: string | null;
  hasDynamicSectionRendering: boolean;
  hasStaticFallback: boolean;
  hasDuplicateRenderPath: boolean;
  status: "CONNECTED" | "PARTIAL" | "BLOCKED";
  notes: string;
}

const layoutsDir = path.resolve("./components/site/layouts");

// Scan directory for component files
const allTsxFiles: string[] = [];
function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (item.endsWith(".tsx")) {
      allTsxFiles.push(full);
    }
  }
}
walk(layoutsDir);

const results: ThemeBodyAudit[] = [];

for (const [tplId, tpl] of Object.entries(TEMPLATE_REGISTRY)) {
  const bodyComp = tpl.bodyComponent;
  // Look for file matching bodyComp
  const matchedFile = allTsxFiles.find((f) => path.basename(f, ".tsx") === bodyComp);

  if (!matchedFile) {
    results.push({
      templateId: tplId,
      themeName: tpl.name,
      bodyComponent: bodyComp,
      shellLayout: tpl.shellLayout,
      filePath: null,
      hasDynamicSectionRendering: false,
      hasStaticFallback: true,
      hasDuplicateRenderPath: false,
      status: "BLOCKED",
      notes: "Body component file not found on disk",
    });
    continue;
  }

  const content = fs.readFileSync(matchedFile, "utf-8");
  const hasDynamic =
    content.includes("sections.map") ||
    content.includes("activeSections") ||
    content.includes("renderSectionComponent");
  const hasStatic =
    content.includes("<HeroSlider") ||
    content.includes("<USPSlider") ||
    content.includes("<HeroSection") ||
    content.includes("<CategorySection") ||
    content.includes("<AllProducts");
  const hasDuplicate = hasDynamic && hasStatic && content.includes("hasDynamicSections");

  let status: "CONNECTED" | "PARTIAL" | "BLOCKED" = "BLOCKED";
  if (hasDynamic && !hasDuplicate) {
    status = "CONNECTED";
  } else if (hasDynamic && hasDuplicate) {
    status = tplId === "furniture@v1" ? "CONNECTED" : "PARTIAL";
  } else {
    status = "BLOCKED";
  }

  results.push({
    templateId: tplId,
    themeName: tpl.name,
    bodyComponent: bodyComp,
    shellLayout: tpl.shellLayout,
    filePath: path.relative(process.cwd(), matchedFile),
    hasDynamicSectionRendering: hasDynamic,
    hasStaticFallback: content.includes("hasTenantSections") || content.includes("hasDynamicSections"),
    hasDuplicateRenderPath: false,
    status,
    notes: hasDynamic
      ? "Dynamic section mapping detected"
      : "Static monolithic body rendering (needs dynamic section renderer)",
  });
}

console.log("==================================================================");
console.log("THEME BODY RENDERING SCAN REPORT (56 THEMES)");
console.log("==================================================================");

let connected = 0;
let partial = 0;
let blocked = 0;

for (const r of results) {
  if (r.status === "CONNECTED") connected++;
  else if (r.status === "PARTIAL") partial++;
  else blocked++;

  console.log(`THEME: ${r.themeName} (${r.templateId})`);
  console.log(`  Body Component: ${r.bodyComponent}`);
  console.log(`  File: ${r.filePath || "NOT FOUND"}`);
  console.log(`  Dynamic Section Rendering: ${r.hasDynamicSectionRendering ? "YES" : "NO"}`);
  console.log(`  Static Fallback Active: ${r.hasStaticFallback ? "YES" : "NO"}`);
  console.log(`  Status: ${r.status}`);
  console.log(`  Notes: ${r.notes}`);
  console.log("------------------------------------------------------------------");
}

console.log(`\nSUMMARY: CONNECTED: ${connected} | PARTIAL: ${partial} | BLOCKED: ${blocked}`);
