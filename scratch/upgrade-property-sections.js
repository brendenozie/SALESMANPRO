const fs = require('fs');
const path = require('path');

const dir = path.resolve('components', 'site', 'layouts', 'PropertyManagementLayout', 'body', 'components');

// 1. AgentsSection
{
  const p = path.join(dir, 'AgentsSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace('"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
  }

  content = content.replace(
    /(<motion\.h2[^>]*>)\s*Meet Our <span className="text-amber-600 dark:text-amber-400">Expert Agents<\/span> 🤝/,
    `$1\n          <EditableElement targetId="home.agents.title" label="Agents Section Title" defaultValue="Meet Our Expert Agents" inline>\n            Meet Our <span className="text-amber-600 dark:text-amber-400">Expert Agents</span> 🤝\n          </EditableElement>`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated AgentsSection');
}

// 2. BlogSection
{
  const p = path.join(dir, 'BlogSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace('"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
  }

  content = content.replace(
    /(<motion\.h2[^>]*>)\s*Our Latest <span className="text-emerald-600 dark:text-teal-400">Insights<\/span>/,
    `$1\n          <EditableElement targetId="home.blog.title" label="Blog Section Title" defaultValue="Our Latest Insights" inline>\n            Our Latest <span className="text-emerald-600 dark:text-teal-400">Insights</span>\n          </EditableElement>`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated BlogSection');
}

// 3. FAQSection
{
  const p = path.join(dir, 'FAQSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace('"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
  }

  content = content.replace(
    /(<motion\.h2[^>]*>)\s*Frequently Asked <span className="text-emerald-600 dark:text-teal-400">Questions<\/span>/,
    `$1\n          <EditableElement targetId="home.faq.title" label="FAQ Section Title" defaultValue="Frequently Asked Questions" inline>\n            Frequently Asked <span className="text-emerald-600 dark:text-teal-400">Questions</span>\n          </EditableElement>`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated FAQSection');
}

// 4. NewsletterSection
{
  const p = path.join(dir, 'NewsletterSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace('"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
  }

  content = content.replace(
    /(<motion\.h2[^>]*>)\s*Get in <span className="text-amber-300 dark:text-amber-400">Touch!<\/span>\s*(<\/motion\.h2>)/,
    `$1\n            <EditableElement targetId="home.contact.title" label="Contact Section Title" defaultValue="Get in Touch!" inline>\n              Get in <span className="text-amber-300 dark:text-amber-400">Touch!</span>\n            </EditableElement>\n          $2`
  );

  content = content.replace(
    /(<motion\.p[^>]*>)\s*Have questions about a listing, market trends, or looking to partner up\? Drop us a message below and we will get right back to you\.\s*(<\/motion\.p>)/,
    `$1\n            <EditableElement targetId="home.contact.description" label="Contact Description" defaultValue="Have questions about a listing, market trends, or looking to partner up? Drop us a message below and we will get right back to you." multiline>\n              Have questions about a listing, market trends, or looking to partner up? Drop us a message below and we will get right back to you.\n            </EditableElement>\n          $2`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated NewsletterSection');
}

// 5. TrendingLocations
{
  const p = path.join(dir, 'TrendingLocations', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace('"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
  }

  content = content.replace(
    /(<SparklesIcon className="w-4 h-4" \/>)\s*Hotspots/,
    `$1\n            <EditableElement targetId="home.trendinglocations.badgeText" label="Hotspots Badge" defaultValue="Hotspots" inline>\n              Hotspots\n            </EditableElement>`
  );

  content = content.replace(
    /(<motion\.h2[^>]*>)\s*Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Destinations<\/span>\s*(<\/motion\.h2>)/,
    `$1\n            <EditableElement targetId="home.trendinglocations.title" label="Trending Destinations Title" defaultValue="Trending Destinations" inline>\n              Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Destinations</span>\n            </EditableElement>\n          $2`
  );

  content = content.replace(
    /(<motion\.p className="text-lg text-gray-600 dark:text-gray-400"[^>]*>)\s*Explore the most sought-after neighborhoods and investment regions with high rental yields and superior lifestyle amenities\.\s*(<\/motion\.p>)/,
    `$1\n            <EditableElement targetId="home.trendinglocations.subtitle" label="Trending Destinations Subtitle" defaultValue="Explore the most sought-after neighborhoods and investment regions with high rental yields and superior lifestyle amenities." multiline>\n              Explore the most sought-after neighborhoods and investment regions with high rental yields and superior lifestyle amenities.\n            </EditableElement>\n          $2`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated TrendingLocations');
}
