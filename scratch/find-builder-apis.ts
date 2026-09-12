import fs from "fs";
import path from "path";

function findFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const res: string[] = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) res.push(...findFiles(full));
    else if (item.includes("website-builder")) res.push(full);
  }
  return res;
}

const apis = findFiles(path.resolve("./app/api"));
console.log("Website Builder APIs found:", apis.length);
apis.forEach((a) => console.log("-", path.relative(process.cwd(), a)));
