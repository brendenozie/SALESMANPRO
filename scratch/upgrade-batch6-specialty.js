const fs = require('fs');
const path = require('path');

function ensureUseClientAndImport(content, compKey) {
  if (!content.includes('EditableElement')) {
    if (content.startsWith("'use client';") || content.startsWith('"use client";')) {
      content = content.replace(/^(['"]use client['"];?\r?\n)/, `$1import { EditableElement } from "@/components/site/EditableElement";\n`);
    } else {
      content = `'use client';\nimport { EditableElement } from "@/components/site/EditableElement";\n` + content;
    }
  }
  return content;
}

// 1. AgroCTA in EcommerceAgrovetLayout
{
  const p = path.resolve('components', 'site', 'layouts', 'EcommerceAgrovetLayout', 'body', 'components', 'AgroCTA', 'FinalAgroCTA.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = ensureUseClientAndImport(content, 'AgroCTA');

    // Badge: Ready for Harvest?
    content = content.replace(
      /<span className="text-\[10px\] font-black uppercase tracking-\[0\.2em\]">\s*Ready for Harvest\?\s*<\/span>/,
      `<EditableElement targetId="home.agroCta.badgeText" label="Badge Text" defaultValue="Ready for Harvest?" inline>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for Harvest?</span>
                </EditableElement>`
    );

    // Headline: Your Farm's Next Chapter Starts Here.
    content = content.replace(
      /<h2 className="text-4xl md:text-6xl font-black text-white leading-\[0\.95\] tracking-tighter mb-8">\s*Your Farm’s <br \/>\s*<span className="italic font-serif font-light text-emerald-400">Next Chapter<\/span> <br \/>\s*Starts Here\.\s*<\/h2>/,
      `<EditableElement targetId="home.agroCta.title" label="Headline" defaultValue="Your Farm’s Next Chapter Starts Here.">
                <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.95] tracking-tighter mb-8">
                  Your Farm’s <br /> 
                  <span className="italic font-serif font-light text-emerald-400">Next Chapter</span> <br /> 
                  Starts Here.
                </h2>
              </EditableElement>`
    );

    // Description
    content = content.replace(
      /<p className="text-emerald-100\/70 text-lg mb-12 max-w-md leading-relaxed font-medium">\s*Whether you’re stocking up for the season or need expert veterinary advice, we’re ready to grow with you\.\s*<\/p>/,
      `<EditableElement targetId="home.agroCta.description" label="Description" defaultValue="Whether you’re stocking up for the season or need expert veterinary advice, we’re ready to grow with you.">
                <p className="text-emerald-100/70 text-lg mb-12 max-w-md leading-relaxed font-medium">
                  Whether you’re stocking up for the season or need expert veterinary advice, we’re ready to grow with you.
                </p>
              </EditableElement>`
    );

    // Buttons
    content = content.replace(
      /(<ShoppingBagIcon className="w-5 h-5" \/>)\s*Start Shopping/,
      `$1\n                  <EditableElement targetId="home.agroCta.primaryCtaText" label="Primary Button Text" defaultValue="Start Shopping" inline>Start Shopping</EditableElement>`
    );
    content = content.replace(
      /(<PhoneIcon className="w-5 h-5" \/>)\s*Inquire Now/,
      `$1\n                  <EditableElement targetId="home.agroCta.secondaryCtaText" label="Secondary Button Text" defaultValue="Inquire Now" inline>Inquire Now</EditableElement>`
    );

    // Portal Active
    content = content.replace(
      /<span className="text-\[10px\] font-bold tracking-widest text-emerald-500">PORTAL ACTIVE<\/span>/,
      `<EditableElement targetId="home.agroCta.portalBadge" label="Portal Badge" defaultValue="PORTAL ACTIVE" inline>
                    <span className="text-[10px] font-bold tracking-widest text-emerald-500">PORTAL ACTIVE</span>
                  </EditableElement>`
    );

    // Connect Directly
    content = content.replace(
      /<h3 className="text-sm font-black uppercase text-white tracking-widest">Connect Directly<\/h3>/,
      `<EditableElement targetId="home.agroCta.formTitle" label="Form Title" defaultValue="Connect Directly">
                            <h3 className="text-sm font-black uppercase text-white tracking-widest">Connect Directly</h3>
                          </EditableElement>`
    );
    content = content.replace(
      /<p className="text-\[10px\] text-zinc-500 font-medium leading-relaxed">\s*Fill out the mobile dispatch\. We will coordinate promptly\.\s*<\/p>/,
      `<EditableElement targetId="home.agroCta.formSubtitle" label="Form Subtitle" defaultValue="Fill out the mobile dispatch. We will coordinate promptly.">
                            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                              Fill out the mobile dispatch. We will coordinate promptly.
                            </p>
                          </EditableElement>`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log('Upgraded AgroCTA in EcommerceAgrovetLayout');
  }
}

// 2. AgroCTA in EcommerceMeatLayout
{
  const p = path.resolve('components', 'site', 'layouts', 'EcommerceMeatLayout', 'body', 'components', 'AgroCTA', 'FinalAgroCTA.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = ensureUseClientAndImport(content, 'AgroCTA');

    // Badge: Limited Prime Stock
    content = content.replace(
      /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\]">\s*Limited Prime Stock\s*<\/span>/,
      `<EditableElement targetId="home.agroCta.badgeText" label="Badge Text" defaultValue="Limited Prime Stock" inline>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Limited Prime Stock</span>
                </EditableElement>`
    );

    // Headline: Secure Your Next Cut Today.
    content = content.replace(
      /<h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-\[0\.85\] tracking-tighter mb-10">\s*Secure Your <br \/>\s*<span className="italic font-serif font-light text-red-600">Next Cut<\/span> <br \/>\s*Today\.\s*<\/h2>/,
      `<EditableElement targetId="home.agroCta.title" label="Headline" defaultValue="Secure Your Next Cut Today.">
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.85] tracking-tighter mb-10">
                  Secure Your <br /> 
                  <span className="italic font-serif font-light text-red-600">Next Cut</span> <br /> 
                  Today.
                </h2>
              </EditableElement>`
    );

    // Description
    content = content.replace(
      /<p className="text-stone-400 text-base mb-10 max-w-sm leading-relaxed font-medium">\s*Whether you're stocking your home freezer or sourcing for a five-star kitchen, our master butchers are ready to prep your order to custom weight and aging guidelines\.\s*<\/p>/,
      `<EditableElement targetId="home.agroCta.description" label="Description" defaultValue="Whether you're stocking your home freezer or sourcing for a five-star kitchen, our master butchers are ready to prep your order to custom weight and aging guidelines.">
                <p className="text-stone-400 text-base mb-10 max-w-sm leading-relaxed font-medium">
                  Whether you're stocking your home freezer or sourcing for a five-star kitchen, our master butchers are ready to prep your order to custom weight and aging guidelines.
                </p>
              </EditableElement>`
    );

    // Primal Blueprint step
    content = content.replace(
      /<label className="text-\[10px\] font-black uppercase tracking-\[0\.2em\] text-stone-500">\s*1\. Select Primal Blueprint\s*<\/label>/,
      `<EditableElement targetId="home.agroCta.selectionStepTitle" label="Selection Step Title" defaultValue="1. Select Primal Blueprint" inline>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                          1. Select Primal Blueprint
                        </label>
                      </EditableElement>`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log('Upgraded AgroCTA in EcommerceMeatLayout');
  }
}

// 3. WatchCareGuide in Watch, Bike, and Motorcycle layouts
const careGuideThemes = ['EcommerceWatchLayout', 'EcommerceBikeLayout', 'EcommerceMotorCycleLayout'];
for (const theme of careGuideThemes) {
  const p = path.resolve('components', 'site', 'layouts', theme, 'body', 'components', 'WatchCareGuide', 'WatchCareGuide.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = ensureUseClientAndImport(content, 'WatchCareGuide');

    // Header Badge: Owner's Manual
    content = content.replace(
      /<span className="text-\[10px\] font-bold tracking-\[0\.4em\] text-amber-600 uppercase block mb-1">\s*Owner's Manual\s*<\/span>/,
      `<EditableElement targetId="home.careGuide.badgeText" label="Manual Badge" defaultValue="Owner's Manual" inline>
                  <span className="text-[10px] font-bold tracking-[0.4em] text-amber-600 uppercase block mb-1">
                    Owner's Manual
                  </span>
                </EditableElement>`
    );

    // Title: Care & Maintenance
    content = content.replace(
      /<h2 className="text-2xl font-serif text-white italic">\s*Care & Maintenance\s*<\/h2>/,
      `<EditableElement targetId="home.careGuide.title" label="Care Guide Title" defaultValue="Care & Maintenance" inline>
                  <h2 className="text-2xl font-serif text-white italic">Care & Maintenance</h2>
                </EditableElement>`
    );

    // Steps mapping
    content = content.replace(
      /(<div key=\{idx\} className="space-y-3 group">\s*<div className="flex items-center gap-3">\s*<step\.Icon className="w-5 h-5 text-amber-600 stroke-\[1\.5\]" \/>\s*)<h3 className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-amber-500 transition-colors">\s*\{step\.title\}\s*<\/h3>(\s*<\/div>\s*)<p className="text-sm text-zinc-500 font-light leading-relaxed">\s*\{step\.description\}\s*<\/p>/,
      `$1<EditableElement targetId={\`home.careGuide.steps.\${idx}.title\`} label={\`Step \${idx + 1} Title\`} defaultValue={step.title} inline>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-amber-500 transition-colors">
                        {step.title}
                      </h3>
                    </EditableElement>$2<EditableElement targetId={\`home.careGuide.steps.\${idx}.description\`} label={\`Step \${idx + 1} Description\`} defaultValue={step.description}>
                      <p className="text-sm text-zinc-500 font-light leading-relaxed">
                        {step.description}
                      </p>
                    </EditableElement>`
    );

    // Visual aid title
    content = content.replace(
      /<p className="text-\[10px\] text-zinc-600 uppercase tracking-widest mb-4">\s*Internal Caliber Schematic\s*<\/p>/,
      `<EditableElement targetId="home.careGuide.visualTitle" label="Visual Schematic Title" defaultValue="Internal Caliber Schematic" inline>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4">Internal Caliber Schematic</p>
                </EditableElement>`
    );

    // Servicing notice
    content = content.replace(
      /<p className="mt-4 text-\[11px\] italic text-zinc-500 text-center">\s*Recommended professional servicing every 3 to 5 years\.\s*<\/p>/,
      `<EditableElement targetId="home.careGuide.servicingNotice" label="Servicing Notice" defaultValue="Recommended professional servicing every 3 to 5 years." inline>
                  <p className="mt-4 text-[11px] italic text-zinc-500 text-center">
                    Recommended professional servicing every 3 to 5 years.
                  </p>
                </EditableElement>`
    );

    // Close button text
    content = content.replace(
      /(<button\s+onClick=\{onClose\}\s+className="text-\[10px\] font-black uppercase tracking-\[0\.3em\] text-zinc-400 hover:text-white transition-colors">\s*)Return to Gallery(\s*<\/button>)/,
      `$1<EditableElement targetId="home.careGuide.closeButtonText" label="Close Button Text" defaultValue="Return to Gallery" inline>Return to Gallery</EditableElement>$2`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log(`Upgraded WatchCareGuide in ${theme}`);
  }
}

// 4. PortfolioLayout BookingFormSection
{
  const p = path.resolve('components', 'site', 'layouts', 'PortfolioLayout', 'body', 'components', 'BookingFormSection', 'index.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = ensureUseClientAndImport(content, 'BookingFormSection');

    // Title
    content = content.replace(
      /(<motion\.h2 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold mb-4 text-gray-900 dark:text-gray-100" variants=\{inputVariants\}>\s*)Book Your <span className="bg-clip-text text-transparent" style=\{\{ backgroundImage: `linear-gradient\(to right, \$\{primaryColor\}, \$\{secondaryColor\}\)` \}\}>Service<\/span>(\s*<\/motion\.h2>)/,
      `<EditableElement targetId="home.bookingForm.title" label="Booking Form Title" defaultValue="Book Your Service">
          $1Book Your <span className="bg-clip-text text-transparent" style={{ backgroundImage: \`linear-gradient(to right, \${primaryColor}, \${secondaryColor})\` }}>Service</span>$2
        </EditableElement>`
    );

    // Subtitle
    content = content.replace(
      /(<motion\.p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-xl mx-auto" variants=\{inputVariants\}>\s*)Tell us about your cleaning needs, and we'll get back to you with a personalized quote and schedule\.(\s*<\/motion\.p>)/,
      `<EditableElement targetId="home.bookingForm.description" label="Booking Form Description" defaultValue="Tell us about your cleaning needs, and we'll get back to you with a personalized quote and schedule.">
          $1Tell us about your cleaning needs, and we'll get back to you with a personalized quote and schedule.$2
        </EditableElement>`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log('Upgraded BookingFormSection in PortfolioLayout');
  }
}

// 5. BarbershopBookingsLayout BookingForm
{
  const p = path.resolve('components', 'site', 'layouts', 'BarbershopBookingsLayout', 'components', 'BookingForm', 'index.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = ensureUseClientAndImport(content, 'BookingForm');

    content = content.replace(
      /<h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">\s*Secure your spot\s*<\/h3>/,
      `<EditableElement targetId="home.bookingForm.title" label="Form Title" defaultValue="Secure your spot" inline>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Secure your spot</h3>
        </EditableElement>`
    );

    content = content.replace(
      /<p className="text-zinc-500 dark:text-zinc-400 font-medium">\s*Select your preferred window below\.\s*<\/p>/,
      `<EditableElement targetId="home.bookingForm.subtitle" label="Form Subtitle" defaultValue="Select your preferred window below." inline>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Select your preferred window below.</p>
        </EditableElement>`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log('Upgraded BookingForm in BarbershopBookingsLayout');
  }
}

// 6. DrycleaningBookingsLayout BookingForm
{
  const p = path.resolve('components', 'site', 'layouts', 'DrycleaningBookingsLayout', 'components', 'BookingForm', 'index.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = ensureUseClientAndImport(content, 'BookingForm');

    content = content.replace(
      /<h3 className="text-2xl font-black text-slate-900 tracking-tight">\s*Secure your spot\s*<\/h3>/,
      `<EditableElement targetId="home.bookingForm.title" label="Form Title" defaultValue="Secure your spot" inline>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Secure your spot</h3>
        </EditableElement>`
    );

    content = content.replace(
      /<p className="text-slate-500 font-medium">\s*Select your preferred window below\.\s*<\/p>/,
      `<EditableElement targetId="home.bookingForm.subtitle" label="Form Subtitle" defaultValue="Select your preferred window below." inline>
          <p className="text-slate-500 font-medium">Select your preferred window below.</p>
        </EditableElement>`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log('Upgraded BookingForm in DrycleaningBookingsLayout');
  }
}

// 7. ConsultancyLayout BookingForm
{
  const p = path.resolve('components', 'site', 'layouts', 'ConsultancyLayout', 'body', 'components', 'BookingForm', 'index.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = ensureUseClientAndImport(content, 'BookingForm');

    content = content.replace(
      /\{isFree \? "Secure Your Copy" : "Ready to Purchase"\}/,
      `<EditableElement targetId="home.bookingForm.title" label="Form Title" defaultValue="Ready to Purchase" inline>
          {isFree ? "Secure Your Copy" : "Ready to Purchase"}
        </EditableElement>`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log('Upgraded BookingForm in ConsultancyLayout');
  }
}

// 8. DeliveryLayout BookingForm
{
  const p = path.resolve('components', 'site', 'layouts', 'DeliveryLayout', 'body', 'components', 'BookingForm', 'index.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = ensureUseClientAndImport(content, 'BookingForm');

    content = content.replace(
      /(<TruckIcon className="w-5 h-5 text-cyan-400" \/>)\s*Schedule \{service\?\.name \|\| "Delivery Service"\}/,
      `$1\n        <EditableElement targetId="home.bookingForm.title" label="Form Title" defaultValue="Schedule Delivery Service" inline>
          Schedule {service?.name || "Delivery Service"}
        </EditableElement>`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log('Upgraded BookingForm in DeliveryLayout');
  }
}

// 9. PublicSpeakingLayout BookingForm
{
  const p = path.resolve('components', 'site', 'layouts', 'PublicSpeakingLayout', 'body', 'components', 'BookingForm', 'index.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = ensureUseClientAndImport(content, 'BookingForm');

    content = content.replace(
      /\{isFree \? "Secure Your Copy" : "Ready to Purchase"\}/,
      `<EditableElement targetId="home.bookingForm.title" label="Form Title" defaultValue="Ready to Purchase" inline>
          {isFree ? "Secure Your Copy" : "Ready to Purchase"}
        </EditableElement>`
    );

    fs.writeFileSync(p, content, 'utf8');
    console.log('Upgraded BookingForm in PublicSpeakingLayout');
  }
}
