const fs = require('fs');
const path = require('path');

// 1. EcommerceHoneyLayout MissionNewsSection
{
  const p = path.resolve('components', 'site', 'layouts', 'EcommerceHoneyLayout', 'body', 'components', 'MissionNewsSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
  }

  // Mission Image
  content = content.replace(
    /(<Image decoding="async"\s*src=\{missionImage\}[\s\S]*?\/>)/,
    `<EditableElement targetId="home.mission.image" label="Mission Image" defaultValue={missionImage} isImage>\n                $1\n              </EditableElement>`
  );

  // Floating Badge
  content = content.replace(
    /(<GlobeAltIcon className="w-4 h-4" \/>)\s*Our Mission/,
    `$1\n                <EditableElement targetId="home.mission.badgeText" label="Mission Badge" defaultValue="Our Mission" inline>\n                  Our Mission\n                </EditableElement>`
  );

  // Purpose Driven Impact
  content = content.replace(
    /Purpose Driven Impact/,
    `<EditableElement targetId="home.mission.subtitle" label="Mission Subtitle" defaultValue="Purpose Driven Impact" inline>Purpose Driven Impact</EditableElement>`
  );

  // Heading Our Mission
  content = content.replace(
    /(<h2[^>]*>)\s*Our Mission\s*(<\/h2>)/,
    `$1\n                  <EditableElement targetId="home.mission.title" label="Mission Title" defaultValue="Our Mission" inline>\n                    Our Mission\n                  </EditableElement>\n                $2`
  );

  // News Latest Updates
  content = content.replace(
    /Latest Updates/,
    `<EditableElement targetId="home.news.badgeText" label="News Badge" defaultValue="Latest Updates" inline>Latest Updates</EditableElement>`
  );

  // News & Insights
  content = content.replace(
    /(<h3[^>]*>)\s*News & Insights\s*(<\/h3>)/,
    `$1\n                  <EditableElement targetId="home.news.title" label="News Title" defaultValue="News & Insights" inline>\n                    News & Insights\n                  </EditableElement>\n                $2`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated MissionNewsSection in EcommerceHoneyLayout');
}

// 2. PublicSpeakingLayout VideoShowcaseSection
{
  const p = path.resolve('components', 'site', 'layouts', 'PublicSpeakingLayout', 'body', 'components', 'VideoShowcaseSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
  }

  content = content.replace(
    /(<span className="text-lg font-semibold text-orange-700 uppercase tracking-wider mb-3 block">)\s*Video Library\s*(<\/span>)/,
    `$1\n            <EditableElement targetId="home.videoshowcase.badgeText" label="Video Library Badge" defaultValue="Video Library" inline>\n              Video Library\n            </EditableElement>\n          $2`
  );

  content = content.replace(
    /(<h2[^>]*>)\s*Watch & Learn: Instant <span className="text-orange-600">Growth<\/span>\s*(<\/h2>)/,
    `$1\n            <EditableElement targetId="home.videoshowcase.title" label="Video Library Title" defaultValue="Watch & Learn: Instant Growth" inline>\n              Watch & Learn: Instant <span className="text-orange-600">Growth</span>\n            </EditableElement>\n          $2`
  );

  content = content.replace(
    /(<p className="text-xl text-gray-700 max-w-3xl mx-auto">)\s*Dive into our featured video sessions covering the essential strategies for career and personal mastery\.\s*(<\/p>)/,
    `$1\n            <EditableElement targetId="home.videoshowcase.subtitle" label="Video Library Subtitle" defaultValue="Dive into our featured video sessions covering the essential strategies for career and personal mastery." multiline>\n              Dive into our featured video sessions covering the essential strategies for career and personal mastery.\n            </EditableElement>\n          $2`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated VideoShowcaseSection in PublicSpeakingLayout');
}

// 3. PortfolioLayout BookingFormModal
{
  const p = path.resolve('components', 'site', 'layouts', 'PortfolioLayout', 'body', 'components', 'BookingFormModal', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace('"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
  }

  content = content.replace(
    /\{loading \? "Booking…" : "Confirm Booking"\}/,
    `{loading ? "Booking…" : <EditableElement targetId="home.booking.confirmText" label="Confirm Booking Button" defaultValue="Confirm Booking" inline>Confirm Booking</EditableElement>}`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated BookingFormModal in PortfolioLayout');
}
