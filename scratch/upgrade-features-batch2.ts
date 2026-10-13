import fs from 'fs';
import path from 'path';

function ensureEditableImport(code: string): string {
  if (code.includes('EditableElement')) return code;
  // Insert import after 'use client';
  if (code.includes("'use client';") || code.includes('"use client";')) {
    return code.replace(
      /(['"]use client['"];?\r?\n)/,
      "$1import { EditableElement } from '@/contexts/EditableContentContext';\n"
    );
  }
  return "import { EditableElement } from '@/contexts/EditableContentContext';\n" + code;
}

// 1. Bookings & Legacy string replacements
const legacyReplacements: Array<{ file: string; from: RegExp | string; to: string }> = [
  {
    file: 'components/site/layouts/BarbershopBookingsLayout/body/components/BenefitsSection/index.tsx',
    from: /targetId=\{`barbershop\.home\.benefits\.benefit\$\{i\}\./g,
    to: 'targetId={`barbershop.home.benefits.items.${i}.',
  },
  {
    file: 'components/site/layouts/BarbershopBookingsLayout/body/components/FeaturesSection/index.tsx',
    from: /targetId=\{`barbershop\.home\.features\.feature\$\{idx\}\./g,
    to: 'targetId={`barbershop.home.features.items.${idx}.',
  },
  {
    file: 'components/site/layouts/BookingsLayout/body/components/BenefitsSection/index.tsx',
    from: /targetId=\{`bookings\.home\.benefits\.item\$\{idx\}\./g,
    to: 'targetId={`bookings.home.benefits.items.${idx}.',
  },
  {
    file: 'components/site/layouts/BookingsLayout/body/components/FeaturesSection/index.tsx',
    from: /targetId=\{`bookings\.home\.features\.item\$\{idx\}\./g,
    to: 'targetId={`bookings.home.features.items.${idx}.',
  },
  {
    file: 'components/site/layouts/DrycleaningBookingsLayout/body/components/BenefitsSection/index.tsx',
    from: /targetId=\{`drycleaning\.home\.benefits\.item\$\{i\}\./g,
    to: 'targetId={`drycleaning.home.benefits.items.${i}.',
  },
  {
    file: 'components/site/layouts/DrycleaningBookingsLayout/body/components/FeaturesSection/index.tsx',
    from: /targetId=\{`drycleaning\.home\.features\.item\$\{idx\}\./g,
    to: 'targetId={`drycleaning.home.features.items.${idx}.',
  },
  {
    file: 'components/site/layouts/SalonBookingsLayout/body/components/BenefitsSection/index.tsx',
    from: /targetId=\{`salon\.home\.benefits\.item\$\{i\}\./g,
    to: 'targetId={`salon.home.benefits.items.${i}.',
  },
  {
    file: 'components/site/layouts/SalonBookingsLayout/body/components/FeaturesSection/index.tsx',
    from: /targetId=\{`salon\.home\.features\.feature\$\{activeIndex\}\./g,
    to: 'targetId={`salon.home.features.items.${activeIndex}.',
  },
  {
    file: 'components/site/layouts/EventsLayout/body/components/FeaturesSection/index.tsx',
    from: /targetId=\{`events\.home\.features\.item\$\{idx\}\./g,
    to: 'targetId={`events.home.features.items.${idx}.',
  },
  {
    file: 'components/site/layouts/FinanceLayout/body/components/ProcessWorkflowSection/index.tsx',
    from: /targetId=\{`finance\.home\.processworkflow\.steps\.\$\{idx\}\./g,
    to: 'targetId={`finance.home.processworkflow.items.${idx}.',
  },
  {
    file: 'components/site/layouts/RealEstateLayout/body/components/WhyChooseUs/index.tsx',
    from: /targetId=\{`realestate\.home\.why_choose_us\.features\.\$\{cardId\}\./g,
    to: 'targetId={`realestate.home.why_choose_us.items.${cardId}.',
  },
];

console.log('--- Step 1: Upgrading Bookings & Legacy targetIds ---');
legacyReplacements.forEach(({ file, from, to }) => {
  const filePath = path.resolve(file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(from, to);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated legacy targets in: ${file}`);
  }
});
