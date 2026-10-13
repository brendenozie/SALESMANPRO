import { TEMPLATE_REGISTRY } from "../lib/website-builder/template-registry";

console.log("Total registered templates:", Object.keys(TEMPLATE_REGISTRY).length);
Object.values(TEMPLATE_REGISTRY).forEach((t, i) => {
  console.log(`${i + 1}. [${t.id}] "${t.name}" (Category: ${t.category}, Shell: ${t.shellLayout}, Body: ${t.bodyComponent})`);
});
