import fs from "fs";
import path from "path";

function findRoutes(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const res: string[] = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) res.push(...findRoutes(full));
    else if (item === "route.ts" || item === "route.js") res.push(full);
  }
  return res;
}

const routes = findRoutes(path.resolve("./app/api"));
console.log("Total API routes:", routes.length);
routes.forEach((r) => {
  const rel = path.relative(process.cwd(), r);
  if (rel.includes("site") || rel.includes("website") || rel.includes("builder") || rel.includes("company")) {
    console.log("-", rel);
  }
});
