const fs = require('fs');
const path = require('path');

const layouts = ['SecurityLayout', 'Security2Layout'];

for (const layout of layouts) {
  const dir = path.resolve('components', 'site', 'layouts', layout, 'body', 'components');

  // --- 1. AboutSection ---
  {
    const p = path.join(dir, 'AboutSection', 'index.tsx');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      if (!content.includes('EditableElement')) {
        content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
      }

      // Badge
      content = content.replace(
        /(<p[^>]*uppercase tracking-widest[^>]*>)\s*([^<]+?)\s*(<\/p>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n                <EditableElement targetId="home.about.badgeText" label="About Badge" defaultValue="${txt.trim()}" inline>\n                  ${txt.trim()}\n                </EditableElement>\n              ${p2}`;
        }
      );

      // Title
      content = content.replace(
        /(<h2[^>]*>)\s*([^<]+?)\s*(<\/h2>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n              <EditableElement targetId="home.about.title" label="About Title" defaultValue="${txt.trim()}" multiline>\n                ${txt.trim()}\n              </EditableElement>\n            ${p2}`;
        }
      );

      // Description {aboutText}
      content = content.replace(
        /\{aboutText\}/,
        `<EditableElement targetId="home.about.description" label="About Description" defaultValue={aboutText} multiline>{aboutText}</EditableElement>`
      );

      // CTA button
      content = content.replace(
        /Request Systems Auditing(\s*<ArrowRightIcon)/,
        `<EditableElement targetId="home.about.ctaText" label="About CTA Button" defaultValue="Request Systems Auditing" inline>Request Systems Auditing</EditableElement>$1`
      );

      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated AboutSection in', layout);
    }
  }

  // --- 2. CaseStudiesSection ---
  {
    const p = path.join(dir, 'CaseStudiesSection', 'index.tsx');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      if (!content.includes('EditableElement')) {
        content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
      }

      // Badge
      content = content.replace(
        /(<p[^>]*uppercase tracking-widest[^>]*>)\s*([^<]+?)\s*(<\/p>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n                <EditableElement targetId="home.casestudies.badgeText" label="Pillars Badge" defaultValue="${txt.trim()}" inline>\n                  ${txt.trim()}\n                </EditableElement>\n              ${p2}`;
        }
      );

      // Title
      content = content.replace(
        /(<h2[^>]*>)\s*([^<]+?)\s*(<\/h2>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n              <EditableElement targetId="home.casestudies.title" label="Pillars Title" defaultValue="${txt.trim()}" multiline>\n                ${txt.trim()}\n              </EditableElement>\n            ${p2}`;
        }
      );

      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated CaseStudiesSection in', layout);
    }
  }

  // --- 3. ContactSection ---
  {
    const p = path.join(dir, 'ContactSection', 'index.tsx');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      if (!content.includes('EditableElement')) {
        content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
      }

      // Badge
      content = content.replace(
        /(<p[^>]*uppercase tracking-widest[^>]*>)\s*([^<]+?)\s*(<\/p>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n                <EditableElement targetId="home.contact.badgeText" label="Contact Badge" defaultValue="${txt.trim()}" inline>\n                  ${txt.trim()}\n                </EditableElement>\n              ${p2}`;
        }
      );

      // Title
      content = content.replace(
        /(<h2[^>]*>)\s*([^<]+?)\s*(<\/h2>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n              <EditableElement targetId="home.contact.title" label="Contact Title" defaultValue="${txt.trim()}" inline>\n                ${txt.trim()}\n              </EditableElement>\n            ${p2}`;
        }
      );

      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated ContactSection in', layout);
    }
  }

  // --- 4. DiscoveryCallSection ---
  {
    const p = path.join(dir, 'DiscoveryCallSection', 'index.tsx');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      if (!content.includes('EditableElement')) {
        content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
      }

      // Badge
      content = content.replace(
        /(<p[^>]*uppercase tracking-widest[^>]*>)\s*([^<]+?)\s*(<\/p>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n                <EditableElement targetId="home.discovery.badgeText" label="Discovery Badge" defaultValue="${txt.trim()}" inline>\n                  ${txt.trim()}\n                </EditableElement>\n              ${p2}`;
        }
      );

      // Title
      content = content.replace(
        /(<h2[^>]*>)\s*\{renderTitleWithAccent\(title, primaryColor\)\}\s*(<\/h2>)/,
        `$1\n              <EditableElement targetId="home.discovery.title" label="Discovery Title" defaultValue={title} inline>\n                {renderTitleWithAccent(title, primaryColor)}\n              </EditableElement>\n            $2`
      );

      // Subtitle
      content = content.replace(
        /\{subtitle\}(\s*<\/motion\.p>)/,
        `<EditableElement targetId="home.discovery.subtitle" label="Discovery Subtitle" defaultValue={subtitle} multiline>{subtitle}</EditableElement>$1`
      );

      // CTA button text
      content = content.replace(
        /\{ctaText\}(\s*<ArrowRightIcon)/,
        `<EditableElement targetId="home.discovery.ctaText" label="Discovery CTA Text" defaultValue={ctaText} inline>{ctaText}</EditableElement>$1`
      );

      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated DiscoveryCallSection in', layout);
    }
  }

  // --- 5. FAQSection ---
  {
    const p = path.join(dir, 'FAQSection', 'index.tsx');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      if (!content.includes('EditableElement')) {
        content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
      }

      // Badge
      content = content.replace(
        /(<p[^>]*uppercase tracking-widest[^>]*>)\s*([^<]+?)\s*(<\/p>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n                <EditableElement targetId="home.faq.badgeText" label="FAQ Badge" defaultValue="${txt.trim()}" inline>\n                  ${txt.trim()}\n                </EditableElement>\n              ${p2}`;
        }
      );

      // Title
      content = content.replace(
        /(<h2[^>]*>)\s*([^<]+?)\s*(<\/h2>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n              <EditableElement targetId="home.faq.title" label="FAQ Title" defaultValue="${txt.trim()}" inline>\n                ${txt.trim()}\n              </EditableElement>\n            ${p2}`;
        }
      );

      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated FAQSection in', layout);
    }
  }

  // --- 6. GettingStartedSection ---
  {
    const p = path.join(dir, 'GettingStartedSection', 'index.tsx');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      if (!content.includes('EditableElement')) {
        content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
      }

      // Badge
      content = content.replace(
        /(<p[^>]*uppercase tracking-widest[^>]*>)\s*([^<]+?)\s*(<\/p>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n                <EditableElement targetId="home.gettingstarted.badgeText" label="Roadmap Badge" defaultValue="${txt.trim()}" inline>\n                  ${txt.trim()}\n                </EditableElement>\n              ${p2}`;
        }
      );

      // Title
      content = content.replace(
        /(<h2[^>]*>)\s*([^<]+?)\s*(<\/h2>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n              <EditableElement targetId="home.gettingstarted.title" label="Roadmap Title" defaultValue="${txt.trim()}" inline>\n                ${txt.trim()}\n              </EditableElement>\n            ${p2}`;
        }
      );

      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated GettingStartedSection in', layout);
    }
  }

  // --- 7. ServicesSection ---
  {
    const p = path.join(dir, 'ServicesSection', 'index.tsx');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      if (!content.includes('EditableElement')) {
        content = content.replace("'use client';", "'use client';\nimport { EditableElement } from \"@/components/site/EditableElement\";");
      }

      // Badge
      content = content.replace(
        /(<p[^>]*uppercase tracking-widest[^>]*>)\s*([^<]+?)\s*(<\/p>)/,
        (match, p1, txt, p2) => {
          if (txt.includes('EditableElement')) return match;
          return `${p1}\n                <EditableElement targetId="home.services.badgeText" label="Services Badge" defaultValue="${txt.trim()}" inline>\n                  ${txt.trim()}\n                </EditableElement>\n              ${p2}`;
        }
      );

      // Title
      content = content.replace(
        /(<h2[^>]*>)\s*\{sectionTitle\}\s*(<\/h2>)/,
        `$1\n              <EditableElement targetId="home.services.title" label="Services Title" defaultValue={sectionTitle} inline>\n                {sectionTitle}\n              </EditableElement>\n            $2`
      );

      // Subtitle
      content = content.replace(
        /\{subtitle\}(\s*<\/p>)/,
        `<EditableElement targetId="home.services.subtitle" label="Services Subtitle" defaultValue={subtitle} multiline>{subtitle}</EditableElement>$1`
      );

      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated ServicesSection in', layout);
    }
  }
}
