import fs from "fs";
import path from "path";
import { TEMPLATE_REGISTRY, getAllTemplates } from "../lib/website-builder/template-registry";
import { getEditableComponent, getAllEditableComponents } from "../lib/website-builder/editable-adapters";

interface ThemeAuditItem {
  templateKey: string;
  name: string;
  category: string;
  variant: string;
  shellLayout: string;
  bodyComponent: string;
  siteFilePath: string | null;
  siteFileExists: boolean;
  sectionsInRegistry: { id: string; name: string; component: string }[];
  sectionsInDOM: { sectionId: string; componentKey: string }[];
  editableIdsInDOM: string[];
  componentsAudit: {
    componentKey: string;
    sectionIdInRegistry?: string;
    sectionIdInDOM?: string;
    hasAdapter: boolean;
    adapterStatus?: string;
    adapterPropCount: number;
    domEditableCount: number;
    status: "EDITABLE" | "UNWRAPPED" | "UNMAPPED" | "VIEW_ONLY";
  }[];
}

function runForensicAudit() {
  const layoutsDir = path.join(process.cwd(), "components/site/layouts");
  const allTemplates = getAllTemplates();

  console.log(`Starting forensic audit of ${allTemplates.length} templates...\n`);

  const results: ThemeAuditItem[] = [];

  for (const tpl of allTemplates) {
    const layoutDir = path.join(layoutsDir, tpl.shellLayout);
    
    // Find body Site.tsx file
    let siteFilePath: string | null = null;
    const candidates = [
      path.join(layoutDir, "body", `${tpl.bodyComponent}.tsx`),
      path.join(layoutDir, `${tpl.bodyComponent}.tsx`),
      path.join(layoutDir, "components", `${tpl.bodyComponent}.tsx`),
      path.join(layoutDir, "body", "components", `${tpl.bodyComponent}.tsx`),
    ];

    // Search recursively in layoutDir if not in candidates
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        siteFilePath = c;
        break;
      }
    }

    if (!siteFilePath && fs.existsSync(layoutDir)) {
      const findFile = (dir: string, name: string): string | null => {
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) {
            const res = findFile(full, name);
            if (res) return res;
          } else if (item.toLowerCase() === `${name.toLowerCase()}.tsx` || item.toLowerCase() === `${tpl.bodyComponent.toLowerCase()}.tsx`) {
            return full;
          }
        }
        return null;
      };
      siteFilePath = findFile(layoutDir, tpl.bodyComponent);
    }

    const siteFileExists = !!siteFilePath && fs.existsSync(siteFilePath);
    let siteContent = "";
    if (siteFileExists && siteFilePath) {
      siteContent = fs.readFileSync(siteFilePath, "utf8");
    }

    // Extract data-editor-section and data-editor-component from siteContent
    const domSections: { sectionId: string; componentKey: string }[] = [];
    const sectionRegex = /data-editor-section=["']([^"']+)["'][^>]*data-editor-component=["']([^"']+)["']|data-editor-component=["']([^"']+)["'][^>]*data-editor-section=["']([^"']+)["']/g;
    let match;
    while ((match = sectionRegex.exec(siteContent)) !== null) {
      const sectionId = match[1] || match[4];
      const componentKey = match[2] || match[3];
      if (sectionId && componentKey) {
        domSections.push({ sectionId, componentKey });
      }
    }

    // Extract all EditableElement and data-editable-id occurrences in the layout directory (including components subfolder, header, footer)
    const domEditableIds: string[] = [];
    const domEditableComponents: { targetId: string; componentKey?: string; file: string }[] = [];

    if (fs.existsSync(layoutDir)) {
      const scanEditables = (dir: string) => {
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) {
            scanEditables(full);
          } else if (item.endsWith(".tsx") || item.endsWith(".jsx")) {
            const code = fs.readFileSync(full, "utf8");
            
            // Match <EditableElement ... targetId={...} or targetId="..."
            const editableElemRegex = /<EditableElement[\s\S]*?targetId=(?:{[`"']([\s\S]*?)[`"']}|["']([\s\S]*?)["'])[\s\S]*?(?:componentKey=["']([^"']+)["'])?[\s\S]*?>/g;
            let em;
            while ((em = editableElemRegex.exec(code)) !== null) {
              const tid = em[1] || em[2] || "";
              const ckey = em[3];
              domEditableIds.push(tid);
              domEditableComponents.push({ targetId: tid, componentKey: ckey, file: path.relative(process.cwd(), full) });
            }

            // Also match static data-editable-id
            const idRegex = /data-editable-id=["']([^"']+)["']/g;
            let m;
            while ((m = idRegex.exec(code)) !== null) {
              domEditableIds.push(m[1]);
              domEditableComponents.push({ targetId: m[1], file: path.relative(process.cwd(), full) });
            }
          }
        }
      };
      scanEditables(layoutDir);
    }

    // Audit each section/component
    const auditedComponents: ThemeAuditItem["componentsAudit"] = [];
    const seenComponents = new Set<string>();

    for (const sec of tpl.authenticSections) {
      seenComponents.add(sec.component);
      const adapter = getEditableComponent(sec.component);
      const domSec = domSections.find(s => s.componentKey.toLowerCase() === sec.component.toLowerCase() || s.sectionId.toLowerCase() === sec.id.toLowerCase());
      
      const relatedEditables = domEditableComponents.filter(c => 
        (c.componentKey && c.componentKey.toLowerCase() === sec.component.toLowerCase()) || 
        c.targetId.toLowerCase().includes(sec.component.toLowerCase()) || 
        c.targetId.toLowerCase().includes(sec.id.toLowerCase())
      );

      let status: "EDITABLE" | "UNWRAPPED" | "UNMAPPED" | "VIEW_ONLY" = "UNWRAPPED";
      if (!adapter || adapter.status === "VIEW_ONLY") {
        status = "VIEW_ONLY";
      } else if (relatedEditables.length > 0) {
        status = "EDITABLE";
      } else {
        status = "UNWRAPPED";
      }

      auditedComponents.push({
        componentKey: sec.component,
        sectionIdInRegistry: sec.id,
        sectionIdInDOM: domSec?.sectionId,
        hasAdapter: !!adapter && adapter.status !== "VIEW_ONLY",
        adapterStatus: adapter?.status,
        adapterPropCount: adapter ? Object.keys(adapter.properties).length : 0,
        domEditableCount: relatedEditables.length,
        status,
      });
    }

    results.push({
      templateKey: tpl.id,
      name: tpl.name,
      category: tpl.category,
      variant: tpl.variant,
      shellLayout: tpl.shellLayout,
      bodyComponent: tpl.bodyComponent,
      siteFilePath,
      siteFileExists,
      sectionsInRegistry: tpl.authenticSections.map(s => ({ id: s.id, name: s.name, component: s.component })),
      sectionsInDOM: domSections,
      editableIdsInDOM: domEditableIds,
      componentsAudit: auditedComponents,
    });
  }

  // Summary metrics
  let totalSections = 0;
  let editableSections = 0;
  let unwrappedSections = 0;
  let viewOnlySections = 0;

  for (const r of results) {
    for (const c of r.componentsAudit) {
      totalSections++;
      if (c.status === "EDITABLE") editableSections++;
      else if (c.status === "UNWRAPPED") unwrappedSections++;
      else if (c.status === "VIEW_ONLY") viewOnlySections++;
    }
  }

  console.log("=======================================================");
  console.log("📊 FORENSIC AUDIT SUMMARY METRICS");
  console.log("=======================================================");
  console.log(`Total Templates Audited: ${results.length}`);
  console.log(`Total Authentic Sections: ${totalSections}`);
  console.log(`Sections with Active DOM Wrappers (EDITABLE): ${editableSections}`);
  console.log(`Sections with Registered Adapter but Missing DOM Wrappers (UNWRAPPED): ${unwrappedSections}`);
  console.log(`Sections in VIEW_ONLY or Missing Adapter (VIEW_ONLY): ${viewOnlySections}`);
  console.log("=======================================================\n");

  // Output detailed JSON report for analysis
  const outputPath = path.join(process.cwd(), "scratch", "forensic-audit-results.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Detailed audit JSON written to: ${outputPath}`);
}

runForensicAudit();
