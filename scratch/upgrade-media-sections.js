const fs = require('fs');
const path = require('path');

const dir = path.resolve('components', 'site', 'layouts', 'MediaLayout', 'body', 'components');

// 1. FAQsSection
{
  const p = path.join(dir, 'FAQsSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
  }

  content = content.replace(
    /(<span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm">)\s*Q & A\s*(<\/span>)/,
    `$1\n                        <EditableElement targetId="home.faq.badgeText" label="FAQ Badge" defaultValue="Q & A" inline>\n                            Q & A\n                        </EditableElement>\n                    $2`
  );

  content = content.replace(
    /(<h2[^>]*>)\s*\{title \|\| "Frequently Asked Questions"\}\s*(<\/h2>)/,
    `$1\n                    <EditableElement targetId="home.faq.title" label="FAQ Title" defaultValue={title || "Frequently Asked Questions"} inline>\n                        {title || "Frequently Asked Questions"}\n                    </EditableElement>\n                $2`
  );

  content = content.replace(
    /(<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">\s*)\{subtitle \|\| "[^"]*?"\}(\s*<\/p>)/,
    `$1<EditableElement targetId="home.faq.subtitle" label="FAQ Subtitle" defaultValue={subtitle || "Everything you need to know about our products and services. If you can't find an answer, please contact us."} multiline>{subtitle || "Everything you need to know about our products and services. If you can't find an answer, please contact us."}</EditableElement>$2`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated FAQsSection');
}

// 2. LatestReleasesSection
{
  const p = path.join(dir, 'LatestReleasesSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
  }

  content = content.replace(
    /(<motion\.span[^>]*>)\s*Video Archive\s*(<\/motion\.span>)/,
    `$1\n              <EditableElement targetId="home.latestreleases.badgeText" label="Releases Badge" defaultValue="Video Archive" inline>\n                Video Archive\n              </EditableElement>\n            $2`
  );

  content = content.replace(
    /(<motion\.h2[^>]*>)\s*\{title \|\| "Latest Official Releases"\}\s*(<\/motion\.h2>)/,
    `$1\n              <EditableElement targetId="home.latestreleases.title" label="Releases Title" defaultValue={title || "Latest Official Releases"} inline>\n                {title || "Latest Official Releases"}\n              </EditableElement>\n            $2`
  );

  content = content.replace(
    /(<motion\.p[^>]*>\s*)\{subtitle \|\| "[^"]*?"\}(\s*<\/motion\.p>)/,
    `$1<EditableElement targetId="home.latestreleases.subtitle" label="Releases Subtitle" defaultValue={subtitle || "Full-length keynotes, product demos, and executive interviews."} multiline>{subtitle || "Full-length keynotes, product demos, and executive interviews."}</EditableElement>$2`
  );

  content = content.replace(
    /View Full Archive(\s*<ArrowUpRightIcon)/,
    `<EditableElement targetId="home.latestreleases.archiveText" label="View Archive Button" defaultValue="View Full Archive" inline>View Full Archive</EditableElement>$1`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated LatestReleasesSection');
}

// 3. LatestVideosSection
{
  const p = path.join(dir, 'LatestVideosSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
  }

  content = content.replace(
    /(<span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900\/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">)\s*Video Content Hub\s*(<\/span>)/,
    `$1\n                    <EditableElement targetId="home.latestvideos.badgeText" label="Videos Badge" defaultValue="Video Content Hub" inline>\n                        Video Content Hub\n                    </EditableElement>\n                $2`
  );

  content = content.replace(
    /(<h2[^>]*>)\s*\{title \|\| "Recent Demos, Keynotes & Tutorials"\}\s*(<\/h2>)/,
    `$1\n                    <EditableElement targetId="home.latestvideos.title" label="Videos Title" defaultValue={title || "Recent Demos, Keynotes & Tutorials"} inline>\n                        {title || "Recent Demos, Keynotes & Tutorials"}\n                    </EditableElement>\n                $2`
  );

  content = content.replace(
    /View All Media(\s*<ArrowRightIcon)/,
    `<EditableElement targetId="home.latestvideos.viewAllText" label="View All Media Button" defaultValue="View All Media" inline>View All Media</EditableElement>$1`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated LatestVideosSection');
}

// 4. NewsletterSignupSection
{
  const p = path.join(dir, 'NewsletterSignupSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace('"use client";', '"use client";\nimport { EditableElement } from "@/components/site/EditableElement";');
  }

  content = content.replace(
    /(<motion\.h2[^>]*>)\s*Let's Build Together! 🚀\s*(<\/motion\.h2>)/,
    `$1\n          <EditableElement targetId="home.newsletter.title" label="Newsletter Title" defaultValue="Let's Build Together! 🚀" inline>\n            Let's Build Together! 🚀\n          </EditableElement>\n        $2`
  );

  content = content.replace(
    /(<motion\.p[^>]*>)\s*Have questions, ideas, or feedback\? Send us a secure line and our specialists will establish contact shortly\.\s*(<\/motion\.p>)/,
    `$1\n          <EditableElement targetId="home.newsletter.description" label="Newsletter Description" defaultValue="Have questions, ideas, or feedback? Send us a secure line and our specialists will establish contact shortly." multiline>\n            Have questions, ideas, or feedback? Send us a secure line and our specialists will establish contact shortly.\n          </EditableElement>\n        $2`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated NewsletterSignupSection');
}

// 5. TopPicksCarouselSection
{
  const p = path.join(dir, 'TopPicksCarouselSection', 'index.tsx');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('EditableElement')) {
    content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
  }

  content = content.replace(
    /(<span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm">)\s*Featured Content\s*(<\/span>)/,
    `$1\n                        <EditableElement targetId="home.toppicks.badgeText" label="Top Picks Badge" defaultValue="Featured Content" inline>\n                            Featured Content\n                        </EditableElement>\n                    $2`
  );

  content = content.replace(
    /(<h2[^>]*>)\s*Spotlight: Our Top Industry Picks\s*(<\/h2>)/,
    `$1\n                    <EditableElement targetId="home.toppicks.title" label="Top Picks Title" defaultValue="Spotlight: Our Top Industry Picks" inline>\n                        Spotlight: Our Top Industry Picks\n                    </EditableElement>\n                $2`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated TopPicksCarouselSection');
}
