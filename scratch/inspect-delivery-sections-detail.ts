import { TEMPLATE_REGISTRY } from "../lib/website-builder/template-registry";

const tpl = TEMPLATE_REGISTRY["delivery@v1"];
console.log(JSON.stringify(tpl.authenticSections, null, 2));
