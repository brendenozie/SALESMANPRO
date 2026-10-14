const fs = require('fs');
const path = require('path');

const layouts = ['CompanyPortfolioLayout', 'CompanyPortfolioLightLayout'];

for (const layout of layouts) {
  const p = path.resolve('components', 'site', 'layouts', layout, 'body', 'components', 'EventsUpdatesSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');

  if (!content.includes('EditableElement')) {
    content = content.replace('"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
  }

  // Header badge: Get Involved
  content = content.replace(
    /(<p[^>]*className="[^"]*uppercase[^"]*font-bold[^"]*"[^>]*>)\s*Get Involved\s*(<\/p>)/,
    `$1\n            <EditableElement targetId="home.events.badgeText" label="Events Badge" defaultValue="Get Involved" inline>\n              Get Involved\n            </EditableElement>\n          $2`
  );

  // Header title: Upcoming Events
  content = content.replace(
    /(<h2[^>]*>)\s*Upcoming Events\s*(<\/h2>)/,
    `$1\n            <EditableElement targetId="home.events.title" label="Events Title" defaultValue="Upcoming Events" inline>\n              Upcoming Events\n            </EditableElement>\n          $2`
  );

  // Header description: Join our community at an upcoming event and help us make a difference.
  content = content.replace(
    /(<p[^>]*max-w-2xl mx-auto[^>]*>)\s*Join our community at an upcoming event and help us make a difference\.\s*(<\/p>)/,
    `$1\n            <EditableElement targetId="home.events.description" label="Events Description" defaultValue="Join our community at an upcoming event and help us make a difference." multiline>\n              Join our community at an upcoming event and help us make a difference.\n            </EditableElement>\n          $2`
  );

  // Footer CTA: View All Events
  content = content.replace(
    /View All Events(\s*<ArrowRightIcon)/,
    `<EditableElement targetId="home.events.viewAllText" label="View All Events Button" defaultValue="View All Events" inline>View All Events</EditableElement>$1`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated EventsUpdatesSection in', layout);
}
