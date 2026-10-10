const path = require("path");
const fs = require("fs");

const layoutsDir = path.join(__dirname, "../components/site/layouts");
const bodyFiles = [];

for (const dir of fs.readdirSync(layoutsDir)) {
  const bodyDir = path.join(layoutsDir, dir, "body");
  if (fs.existsSync(bodyDir)) {
    const files = fs.readdirSync(bodyDir).filter(f => f.endsWith(".tsx"));
    for (const f of files) {
      bodyFiles.push({ dir, file: f, fullPath: path.join(bodyDir, f) });
    }
  }
}

console.log(`Found ${bodyFiles.length} body component files.`);

const analysis = [];
for (const b of bodyFiles) {
  const content = fs.readFileSync(b.fullPath, "utf-8");
  const usesThemeSectionContainer = content.includes("ThemeSectionContainer");
  const usesSectionsProp = content.includes("sections") || content.includes("pageData.sections") || content.includes("pageData?.sections");
  const usesEditableElement = content.includes("EditableElement") || content.includes("useEditableContent");
  const usesStoreContext = content.includes("useStore") || content.includes("StoreContext");
  const usesComponentOverrides = content.includes("componentOverrides");

  analysis.push({
    dir: b.dir,
    file: b.file,
    usesThemeSectionContainer,
    usesSectionsProp,
    usesEditableElement,
    usesStoreContext,
    usesComponentOverrides,
  });
}

console.log("THEME BODY ARCHITECTURE BREAKDOWN:");
console.table(
  analysis.map(a => ({
    theme: a.dir,
    hasContainer: a.usesThemeSectionContainer,
    readsSections: a.usesSectionsProp,
    readsEditable: a.usesEditableElement,
    readsStore: a.usesStoreContext,
    readsOverrides: a.usesComponentOverrides
  }))
);

const containerCount = analysis.filter(a => a.usesThemeSectionContainer).length;
const sectionsCount = analysis.filter(a => a.readsSections).length;
const editableCount = analysis.filter(a => a.readsEditable).length;
const overridesCount = analysis.filter(a => a.readsOverrides).length;

console.log(`Summary:
Total Body Files: ${analysis.length}
Uses ThemeSectionContainer: ${containerCount}
Reads pageData.sections: ${sectionsCount}
Uses EditableElement: ${editableCount}
Uses componentOverrides: ${overridesCount}
`);
