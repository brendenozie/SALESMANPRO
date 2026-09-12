import fs from "fs";

const content = fs.readFileSync("prisma/schema.prisma", "utf-8");

const models = ["Website", "WebsitePage", "WebsiteSection", "WebsiteRevision"];

for (const m of models) {
  const reg = new RegExp(`model\\s+${m}\\s*\\{[\\s\\S]*?\\n\\}`);
  const match = content.match(reg);
  console.log(`=== MODEL: ${m} ===`);
  console.log(match ? match[0] : "NOT FOUND");
  console.log("\n--------------------------------------------------\n");
}
