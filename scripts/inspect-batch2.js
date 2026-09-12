const fs = require('fs');
const path = require('path');

const batch2Files = [
  'components/site/layouts/BarbershopBookingsLayout/body/BarbershopBookingsSite.tsx',
  'components/site/layouts/BookingsLayout/body/BookingsSite.tsx',
  'components/site/layouts/DrycleaningBookingsLayout/body/DrycleaningBookingsSite.tsx',
  'components/site/layouts/ServicesLayout/body/ServiceSite.tsx',
  'components/site/layouts/ConsultancyLayout/body/ConsultancySite.tsx',
  'components/site/layouts/PublicSpeakingLayout/body/PublicSpeakingSite.tsx',
  'components/site/layouts/SalonBookingsLayout/body/BookingsSite.tsx',
];

batch2Files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.log('MISSING:', f);
    return;
  }
  const content = fs.readFileSync(f, 'utf8');
  const sections = [];
  const regex = /data-editor-section=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    sections.push(match[1]);
  }
  console.log(`${path.basename(path.dirname(path.dirname(f)))} / ${path.basename(f)} (${sections.length} tagged sections):`, sections);
});
