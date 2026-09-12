import fs from "fs";

const content = fs.readFileSync("prisma/schema.prisma", "utf-8");

const models = ["Website", "WebsitePage", "WebsiteSection", "WebsiteRevision", "PageSection", "Company"];

for (const name of models) {
  const reg = new RegExp(`model\\s+${name}\\s*\\{[\\s\\S]*?\\n\\}`, "g");
  const match = content.match(reg);
  if (match) {
    console.log(`=== MODEL: ${name} ===`);
    console.log(match[0]);
    console.log("\n");
  } else {
    console.log(`=== MODEL: ${name} (NOT FOUND) ===\n`);
  }
}
