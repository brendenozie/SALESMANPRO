import fs from "fs";
import path from "path";

function searchDir(dir: string, term: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const res: string[] = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      res.push(...searchDir(full, term));
    } else {
      const content = fs.readFileSync(full, "utf-8");
      if (content.includes(term)) {
        res.push(full);
      }
    }
  }
  return res;
}

const matches = searchDir(path.resolve("./app"), "SAVE_DRAFT");
console.log("Files containing 'SAVE_DRAFT':", matches.length);
matches.forEach((m) => console.log("-", path.relative(process.cwd(), m)));

const routeMatches = searchDir(path.resolve("./app"), "WebsiteRevision");
console.log("\nFiles containing 'WebsiteRevision':", routeMatches.length);
routeMatches.forEach((m) => console.log("-", path.relative(process.cwd(), m)));
