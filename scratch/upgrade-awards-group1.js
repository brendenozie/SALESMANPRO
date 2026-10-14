const fs = require('fs');
const path = require('path');

function upgradeGroup1File(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\r\n/g, '\n');

  // 1. Add EditableElement import if missing
  if (!content.includes('EditableElement')) {
    content = content.replace(
      /from ['"]@\/types\/typings['"];/,
      `from '@/types/typings';\nimport { EditableElement } from '@/components/site/EditableElement';`
    );
  }

  // 2. Wrap eyebrow
  if (!content.includes('targetId="home.awards.badgeText"')) {
    content = content.replace(
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

  // 3. Wrap Title
  if (!content.includes('targetId="home.awards.title"')) {
    content = content.replace(
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
  }

  // 4. Wrap verification text
  if (!content.includes('targetId="home.awards.panelText"')) {
    content = content.replace(
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
  }

  // 5. Wrap award name in loop
  if (!content.includes('targetId={`home.awards.awards.${idx}.name`}')) {
    content = content.replace(
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
  }

  // 6. Wrap bottom ticker
  if (!content.includes('targetId="home.awards.ticker"')) {
    content = content.replace(
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

  fs.writeFileSync(filePath, content, 'utf8');
}

const testFile = 'components/site/layouts/Automotive2Layout/body/components/AwardsSection/index.tsx';
upgradeGroup1File(testFile);
console.log('Upgraded test file:', testFile);
