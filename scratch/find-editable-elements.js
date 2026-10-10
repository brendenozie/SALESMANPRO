const path = require("path");
const fs = require("fs");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

const layoutsDir = path.join(__dirname, "../components/site/layouts");
const allLayoutFiles = walk(layoutsDir);

console.log(`Auditing ${allLayoutFiles.length} files in components/site/layouts...`);

const usingEditableElement = [];
const usingComponentOverrides = [];
const usingSectionContent = [];

for (const f of allLayoutFiles) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(layoutsDir, f);
  if (content.includes("EditableElement") || content.includes("useEditableContent")) {
    usingEditableElement.push(rel);
  }
  if (content.includes("componentOverrides")) {
    usingComponentOverrides.push(rel);
  }
  if (content.includes("sectionContent")) {
    usingSectionContent.push(rel);
  }
}

console.log(`Files using EditableElement (${usingEditableElement.length}):`);
console.log(usingEditableElement.slice(0, 15));

console.log(`\nFiles using componentOverrides (${usingComponentOverrides.length}):`);
console.log(usingComponentOverrides.slice(0, 15));

console.log(`\nFiles using sectionContent (${usingSectionContent.length}):`);
console.log(usingSectionContent.slice(0, 15));
