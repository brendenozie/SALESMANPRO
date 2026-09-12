import { parseCanonicalTargetId, getCanonicalLookupKeys } from "../lib/website-builder/canonical-target-id";
import { getEditableComponent } from "../lib/website-builder/editable-adapters";

const rawTargetId = "furniture.home.sec-furniture-uspslider-1789200740228.USPSlider.items-0.title";
console.log("Testing rawTargetId:", rawTargetId);

const parsed = parseCanonicalTargetId(rawTargetId);
console.log("Parsed identity:", parsed);

const lookupKeys = getCanonicalLookupKeys(rawTargetId);
console.log("Lookup keys generated:", lookupKeys);

const adapter = getEditableComponent("USPSlider");
console.log("Adapter registered:", !!adapter);
console.log("Adapter properties count:", Object.keys(adapter?.properties || {}).length);
console.log("Adapter property keys:", Object.keys(adapter?.properties || {}));

// Check if any lookup key matches an adapter property key
const matches = lookupKeys.filter(k => adapter?.properties[k] !== undefined);
console.log("Matching adapter property keys:", matches);

// Also check leaf key
console.log("Leaf fieldKey:", parsed.fieldKey);
console.log("Does adapter have leaf key?", !!adapter?.properties[parsed.fieldKey]);
