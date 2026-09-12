import fs from "fs";
import path from "path";

const comps = [
  "HeroSlider",
  "AbSection",
  "TeamSection",
  "ServicesSection",
  "BookingSection",
  "TestimonialsCarouselSection",
  "WorkShowCase",
  "ProcessTimeline",
  "SocialProofSection",
  "NetworkMap",
  "BlogSection",
  "CallToActionSection",
];

const dir = path.resolve("./components/site/layouts/DeliveryLayout/body/components");

for (const c of comps) {
  const cPath = path.join(dir, c);
  if (!fs.existsSync(cPath)) {
    console.log(`❌ ${c} NOT FOUND at ${cPath}`);
    continue;
  }
  const files = fs.readdirSync(cPath);
  const mainFile = files.find((f) => f === "index.tsx" || f === `${c}.tsx`) || files[0];
  const content = fs.readFileSync(path.join(cPath, mainFile), "utf-8");
  
  // Find function declaration or props interface
  const funcMatch = content.match(/export\s+(default\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
  const interfaceMatch = content.match(/interface\s+(\w+Props)\s*\{[\s\S]*?\}/);

  console.log(`=== ${c} (${mainFile}) ===`);
  if (funcMatch) console.log(`Function: ${funcMatch[2]}(${funcMatch[3].replace(/\n/g, " ")})`);
  if (interfaceMatch) console.log(interfaceMatch[0]);
  console.log("--------------------------------------------------");
}
