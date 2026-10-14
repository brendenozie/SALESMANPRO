const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) files = files.concat(walk(p));
    else if (p.endsWith('AwardsSection/index.tsx') || p.endsWith('AwardsSection\\index.tsx')) files.push(p);
  }
  return files;
}

const allAwardsFiles = walk('components/site/layouts');
console.log('Found total Awards files:', allAwardsFiles.length);

let upgradedCount = 0;

for (const file of allAwardsFiles) {
  // CRITICAL: Protect reference standard
  if (file.includes('EcommerceShoesLayout')) {
    console.log('Skipping protected reference standard:', file);
    continue;
  }

  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/\r\n/g, '\n');

  // 1. Ensure EditableElement is imported
  if (!code.includes('EditableElement')) {
    // Check if useStoreContext is imported
    if (code.includes("from '@/contexts/StoreContext';")) {
      code = code.replace(
        "from '@/contexts/StoreContext';",
        "from '@/contexts/StoreContext';\nimport { EditableElement } from '@/components/site/EditableElement';"
      );
    } else {
      code = `import { EditableElement } from '@/components/site/EditableElement';\n` + code;
    }
  }

  // 2. Wrap Eyebrows if not yet wrapped
  if (!code.includes('targetId="home.awards.badgeText"')) {
    // Check Group 1: Achievements_Unlocked
    if (code.includes('Achievements_Unlocked')) {
      code = code.replace(
        /(<span className="[^"]*tracking-\[0\.5em\][^"]*">\s*Achievements_Unlocked\s*<\/span>)/,
        `<EditableElement
                targetId="home.awards.badgeText"
                componentKey="AwardsSection"
                elementKey="badgeText"
                label="Awards Badge"
                defaultValue="Achievements_Unlocked"
                inline
              >
                $1
              </EditableElement>`
      );
    } 
    // Check Group 2: Industry Accolades
    else if (code.includes('Industry Accolades')) {
      code = code.replace(
        /(<span className="[^"]*uppercase tracking-\[0\.3em\][^"]*">\s*Industry Accolades\s*<\/span>)/,
        `<EditableElement
                targetId="home.awards.badgeText"
                componentKey="AwardsSection"
                elementKey="badgeText"
                label="Awards Badge"
                defaultValue="Industry Accolades"
                inline
              >
                $1
              </EditableElement>`
      );
    }
    // Check Group 2: Quality Assurance
    else if (code.includes('Quality Assurance')) {
      code = code.replace(
        /(<span className="[^"]*uppercase tracking-\[0\.4em\][^"]*">\s*Quality Assurance\s*<\/span>)/,
        `<EditableElement
                targetId="home.awards.badgeText"
                componentKey="AwardsSection"
                elementKey="badgeText"
                label="Awards Badge"
                defaultValue="Quality Assurance"
                inline
              >
                $1
              </EditableElement>`
      );
    }
    // Check Group 2: Excellence in Care
    else if (code.includes('Excellence in Care')) {
      code = code.replace(
        /(<span className="[^"]*uppercase tracking-\[0\.4em\][^"]*">\s*Excellence in Care\s*<\/span>)/,
        `<EditableElement
                targetId="home.awards.badgeText"
                componentKey="AwardsSection"
                elementKey="badgeText"
                label="Awards Badge"
                defaultValue="Excellence in Care"
                inline
              >
                $1
              </EditableElement>`
      );
    }
    // Generic fallback for eyebrow badge
    else if (/(<span className="[^"]*(?:tracking-\[0\.[345]em\]|tracking-widest)[^"]*">([A-Za-z\s_&]+)<\/span>)/.test(code)) {
      code = code.replace(
        /(<span className="[^"]*(?:tracking-\[0\.[345]em\]|tracking-widest)[^"]*">([A-Za-z\s_&]+)<\/span>)/,
        (match, full, text) => {
          return `<EditableElement
                targetId="home.awards.badgeText"
                componentKey="AwardsSection"
                elementKey="badgeText"
                label="Awards Badge"
                defaultValue="${text.trim()}"
                inline
              >
                ${full}
              </EditableElement>`;
        }
      );
    }
  }

  // 3. Wrap Title if not yet wrapped
  if (!code.includes('targetId="home.awards.title"')) {
    if (code.includes('RECOGNIZED FOR')) {
      code = code.replace(
        /(<h2 className="[^"]*font-black italic text-white uppercase[^"]*">[\s\S]*?<\/h2>)/,
        `<EditableElement
              targetId="home.awards.title"
              componentKey="AwardsSection"
              elementKey="title"
              label="Awards Title"
              defaultValue="RECOGNIZED FOR DOMINANCE"
            >
              $1
            </EditableElement>`
      );
    } else if (code.includes('A Legacy of') || code.includes('Legacy of')) {
      code = code.replace(
        /(<h2 className="[^"]*text-slate-900[^"]*">[\s\S]*?<\/h2>)/,
        `<EditableElement
              targetId="home.awards.title"
              componentKey="AwardsSection"
              elementKey="title"
              label="Awards Title"
              defaultValue="A Legacy of Growth & Trust"
            >
              $1
            </EditableElement>`
      );
    } else if (code.includes('Certified For') || code.includes('Certified for')) {
      code = code.replace(
        /(<h2 className="[^"]*text-zinc-900[^"]*">[\s\S]*?<\/h2>)/,
        `<EditableElement
              targetId="home.awards.title"
              componentKey="AwardsSection"
              elementKey="title"
              label="Awards Title"
              defaultValue="Certified For The Road"
            >
              $1
            </EditableElement>`
      );
    } else if (code.includes('Globally Recognized for')) {
      code = code.replace(
        /(<h2 className="[^"]*text-zinc-900[^"]*">[\s\S]*?<\/h2>)/,
        `<EditableElement
              targetId="home.awards.title"
              componentKey="AwardsSection"
              elementKey="title"
              label="Awards Title"
              defaultValue="Globally Recognized for Safety & Quality"
            >
              $1
            </EditableElement>`
      );
    } else {
      // General h2 in header
      code = code.replace(
        /(<h2[^>]*>[\s\S]*?<\/h2>)/,
        `<EditableElement
              targetId="home.awards.title"
              componentKey="AwardsSection"
              elementKey="title"
              label="Awards Title"
            >
              $1
            </EditableElement>`
      );
    }
  }

  // 4. Wrap description / panelText if not yet wrapped
  if (!code.includes('targetId="home.awards.panelText"') && !code.includes('targetId="home.awards.description"')) {
    if (code.includes('Verified by global industry leaders')) {
      code = code.replace(
        /(<p className="text-zinc-500 font-mono text-\[10px\] uppercase[^>]*>[\s\S]*?<\/p>)/,
        `<EditableElement
            targetId="home.awards.panelText"
            componentKey="AwardsSection"
            elementKey="panelText"
            label="Verification Panel Text"
            defaultValue="Verified by global industry leaders // High performance standards met."
          >
            $1
          </EditableElement>`
      );
    } else if (code.includes('Every system, spare, and component')) {
      code = code.replace(
        /(<p className="text-sm font-medium text-zinc-500[^>]*>[\s\S]*?<\/p>)/,
        `<EditableElement
            targetId="home.awards.description"
            componentKey="AwardsSection"
            elementKey="description"
            label="Awards Description"
            type="textarea"
          >
            $1
          </EditableElement>`
      );
    } else if (code.includes('Our commitment to the farming community')) {
      code = code.replace(
        /(<p className="text-slate-500 font-medium max-w-xs[^>]*>[\s\S]*?<\/p>)/,
        `<EditableElement
            targetId="home.awards.description"
            componentKey="AwardsSection"
            elementKey="description"
            label="Awards Description"
            type="textarea"
          >
            $1
          </EditableElement>`
      );
    }
  }

  // 5. Wrap award name in loop if not yet wrapped
  if (!code.includes('targetId={`home.awards.awards.${idx}.name`}') && !code.includes('targetId={`home.awards.awards.${idx}.title`}')) {
    if (code.includes('{label}')) {
      code = code.replace(
        /(<h3 className="[^"]*font-black italic text-zinc-400 group-hover:text-white uppercase[^"]*">[\s\S]*?\{label\}[\s\S]*?<\/h3>)/,
        `<EditableElement
                      targetId={\`home.awards.awards.\${idx}.name\`}
                      componentKey="AwardsSection"
                      elementKey="name"
                      label={\`Award #\${idx + 1} Name\`}
                      defaultValue={label}
                      inline
                    >
                      $1
                    </EditableElement>`
      );
    } else if (code.includes('{award.name}')) {
      code = code.replace(
        /(<h3[^>]*>[\s\S]*?\{award\.name\}[\s\S]*?<\/h3>)/,
        `<EditableElement
                    targetId={\`home.awards.awards.\${idx}.name\`}
                    componentKey="AwardsSection"
                    elementKey="name"
                    label={\`Award #\${idx + 1} Name\`}
                    defaultValue={award?.name}
                    inline
                  >
                    $1
                  </EditableElement>`
      );
    } else if (code.includes('{award?.name}')) {
      code = code.replace(
        /(<h3[^>]*>[\s\S]*?\{award\?\.name\}[\s\S]*?<\/h3>)/,
        `<EditableElement
                    targetId={\`home.awards.awards.\${idx}.name\`}
                    componentKey="AwardsSection"
                    elementKey="name"
                    label={\`Award #\${idx + 1} Name\`}
                    defaultValue={award?.name}
                    inline
                  >
                    $1
                  </EditableElement>`
      );
    }
  }

  // 6. Wrap bottom ticker if present and not yet wrapped
  if (code.includes('Elite Tier Certification Active') && !code.includes('targetId="home.awards.ticker"')) {
    code = code.replace(
      /(<span className="font-mono text-\[10px\] text-zinc-600 uppercase tracking-\[0\.3em\]">\s*Elite Tier Certification Active\s*<\/span>)/,
      `<EditableElement
            targetId="home.awards.ticker"
            componentKey="AwardsSection"
            elementKey="ticker"
            label="Awards Status Ticker"
            defaultValue="Elite Tier Certification Active"
            inline
          >
            $1
          </EditableElement>`
    );
  }

  fs.writeFileSync(file, code, 'utf8');
  upgradedCount++;
}

console.log('Successfully upgraded total AwardsSection files:', upgradedCount);
