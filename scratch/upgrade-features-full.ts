import fs from 'fs';
import path from 'path';

function ensureEditableImport(code: string): string {
  if (code.includes('EditableElement')) return code;
  if (code.includes("'use client';") || code.includes('"use client";')) {
    return code.replace(
      /(['"]use client['"];?\r?\n)/,
      "$1import { EditableElement } from '@/contexts/EditableContentContext';\n"
    );
  }
  return "import { EditableElement } from '@/contexts/EditableContentContext';\n" + code;
}

// =========================================================================
// 1. Upgrade 16 MetricsSection components
// =========================================================================
const metricFiles = [
  'components/site/layouts/EcommerceAccessoriesLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceBabyLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceBookLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceCakeLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceEarphonesLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceFlowersLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceGamingLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceGroceriesLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceHardwareLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceHoneyLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceMotorCycleLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommercePeanutsLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommercePetsLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceAgrovetLayout/body/components/MetricsSection/index.tsx',
  'components/site/layouts/EcommerceMeatLayout/body/components/MetricsSection/index.tsx',
];

metricFiles.forEach((file) => {
  const filePath = path.resolve(file);
  let code = fs.readFileSync(filePath, 'utf8');
  code = ensureEditableImport(code);

  // If Flowers or EcommerceLayout, add index to MetricCard params and callsite
  if (file.includes('FlowersLayout') || file.includes('EcommerceLayout/')) {
    code = code.replace(
      /const MetricCard\s*=\s*\(\{([\s\S]*?)\}\s*:\s*\{/,
      'const MetricCard = ({ index = 0, $1}: { index?: number; '
    );
    code = code.replace(
      /<MetricCard([\s\S]*?)key=\{value\.id\}/,
      '<MetricCard index={index} key={value.id}'
    );
  }

  // Wrap h3 with EditableElement
  code = code.replace(
    /<h3([^>]*)>\s*\{title\}\s*<\/h3>/,
    `<EditableElement
          targetId={\`home.metrics.items.\${index}.title\`}
          componentKey="MetricsSection"
          elementKey="title"
          label={\`Metric \${index + 1} Title\`}
          defaultValue={title}
        >
          {(val) => (
            <h3$1>
              {val ?? title}
            </h3>
          )}
        </EditableElement>`
  );

  // Wrap p with EditableElement
  code = code.replace(
    /<p([^>]*)>\s*\{description\}\s*<\/p>/,
    `<EditableElement
          targetId={\`home.metrics.items.\${index}.description\`}
          componentKey="MetricsSection"
          elementKey="description"
          label={\`Metric \${index + 1} Description\`}
          type="textarea"
          defaultValue={description}
        >
          {(val) => (
            <p$1>
              {val ?? description}
            </p>
          )}
        </EditableElement>`
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`Upgraded MetricsSection in: ${file}`);
});

// =========================================================================
// 2. Upgrade 4 FeaturesBarSection components
// =========================================================================
const featuresBarFiles = [
  'components/site/layouts/EcommerceAccessoriesLayout/body/components/FeaturesBarSection/index.tsx',
  'components/site/layouts/EcommerceBabyLayout/body/components/FeaturesBarSection/index.tsx',
  'components/site/layouts/EcommerceBookLayout/body/components/FeaturesBarSection/index.tsx',
  'components/site/layouts/EcommerceHardwareLayout/body/components/FeaturesBarSection/index.tsx',
];

featuresBarFiles.forEach((file) => {
  const filePath = path.resolve(file);
  let code = fs.readFileSync(filePath, 'utf8');
  code = ensureEditableImport(code);

  code = code.replace(
    /<h3([^>]*)>\s*\{feature\.title\}\s*<\/h3>/,
    `<EditableElement
                    targetId={\`home.features_bar.items.\${index}.title\`}
                    componentKey="FeaturesBarSection"
                    elementKey="title"
                    label={\`Feature \${index + 1} Title\`}
                    defaultValue={feature.title}
                  >
                    {(val) => (
                      <h3$1>
                        {val ?? feature.title}
                      </h3>
                    )}
                  </EditableElement>`
  );

  code = code.replace(
    /<p([^>]*)>\s*\{feature\.description\}\s*<\/p>/,
    `<EditableElement
                    targetId={\`home.features_bar.items.\${index}.description\`}
                    componentKey="FeaturesBarSection"
                    elementKey="description"
                    label={\`Feature \${index + 1} Description\`}
                    type="textarea"
                    defaultValue={feature.description}
                  >
                    {(val) => (
                      <p$1>
                        {val ?? feature.description}
                      </p>
                    )}
                  </EditableElement>`
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`Upgraded FeaturesBarSection in: ${file}`);
});

// =========================================================================
// 3. Upgrade 3 Spotlights (Bike, MotorCycle, Watch)
// =========================================================================
// BikeFeatureSection
const bikeFile = path.resolve('components/site/layouts/EcommerceBikeLayout/body/components/FeatureSection/index.tsx');
if (fs.existsSync(bikeFile)) {
  let code = fs.readFileSync(bikeFile, 'utf8');
  code = ensureEditableImport(code);
  // Add canonical item target so it matches canonical standard
  code = code.replace(
    'targetId="home.feature.title"',
    'targetId="home.feature.items.0.title"'
  );
  code = code.replace(
    'targetId="home.feature.description"',
    'targetId="home.feature.items.0.description"'
  );
  fs.writeFileSync(bikeFile, code, 'utf8');
  console.log(`Upgraded BikeFeatureSection`);
}

// MotorCycleFeatureSection
const motoFile = path.resolve('components/site/layouts/EcommerceMotorCycleLayout/body/components/FeatureSection/index.tsx');
if (fs.existsSync(motoFile)) {
  let code = fs.readFileSync(motoFile, 'utf8');
  code = ensureEditableImport(code);
  code = code.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/,
    `<EditableElement
                targetId="home.feature.items.0.title"
                componentKey="FeatureSection"
                elementKey="title"
                label="Feature Title"
                defaultValue={sectionData.title}
              >
                {(val) => (
                  <h2$1>
                    {val ?? sectionData.title}
                  </h2>
                )}
              </EditableElement>`
  );
  code = code.replace(
    /<p([^>]*)>([\s\S]*?\{sectionData\.description\}[\s\S]*?)<\/p>/,
    `<EditableElement
                targetId="home.feature.items.0.description"
                componentKey="FeatureSection"
                elementKey="description"
                label="Feature Description"
                type="textarea"
                defaultValue={sectionData.description}
              >
                {(val) => (
                  <p$1>
                    {val ?? sectionData.description}
                  </p>
                )}
              </EditableElement>`
  );
  fs.writeFileSync(motoFile, code, 'utf8');
  console.log(`Upgraded MotorCycleFeatureSection`);
}

// WatchFeatureSection
const watchFile = path.resolve('components/site/layouts/EcommerceWatchLayout/body/components/FeatureSection/index.tsx');
if (fs.existsSync(watchFile)) {
  let code = fs.readFileSync(watchFile, 'utf8');
  code = ensureEditableImport(code);
  code = code.replace(
    /<motion\.h2([^>]*)>\s*\{sectionData\.title\}\s*<\/motion\.h2>/,
    `<EditableElement
              targetId="home.feature.items.0.title"
              componentKey="FeatureSection"
              elementKey="title"
              label="Feature Title"
              defaultValue={sectionData.title}
            >
              {(val) => (
                <motion.h2$1>
                  {val ?? sectionData.title}
                </motion.h2>
              )}
            </EditableElement>`
  );
  code = code.replace(
    /<p([^>]*)>\s*\{sectionData\.description\}\s*<\/p>/,
    `<EditableElement
                targetId="home.feature.items.0.description"
                componentKey="FeatureSection"
                elementKey="description"
                label="Feature Description"
                type="textarea"
                defaultValue={sectionData.description}
              >
                {(val) => (
                  <p$1>
                    {val ?? sectionData.description}
                  </p>
                )}
              </EditableElement>`
  );
  fs.writeFileSync(watchFile, code, 'utf8');
  console.log(`Upgraded WatchFeatureSection`);
}

// =========================================================================
// 4. Upgrade EcommerceGlassesLayout/FeatureGrid
// =========================================================================
const glassesGridFile = path.resolve('components/site/layouts/EcommerceGlassesLayout/body/components/FeatureGrid/index.tsx');
if (fs.existsSync(glassesGridFile)) {
  let code = fs.readFileSync(glassesGridFile, 'utf8');
  code = ensureEditableImport(code);
  code = code.replace(
    /<h3 className="text-white font-bold text-xl tracking-tight">\{f\.title\}<\/h3>/,
    `<EditableElement
                targetId={\`home.features.items.\${i}.title\`}
                componentKey="FeatureGrid"
                elementKey="title"
                label={\`Feature \${i + 1} Title\`}
                defaultValue={f.title}
              >
                {(val) => (
                  <h3 className="text-white font-bold text-xl tracking-tight">
                    {val ?? f.title}
                  </h3>
                )}
              </EditableElement>`
  );
  code = code.replace(
    /<p className="text-gray-400 text-sm leading-relaxed max-w-\[280px\]">\{f\.desc\}<\/p>/,
    `<EditableElement
                targetId={\`home.features.items.\${i}.description\`}
                componentKey="FeatureGrid"
                elementKey="description"
                label={\`Feature \${i + 1} Description\`}
                type="textarea"
                defaultValue={f.desc}
              >
                {(val) => (
                  <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
                    {val ?? f.desc}
                  </p>
                )}
              </EditableElement>`
  );
  fs.writeFileSync(glassesGridFile, code, 'utf8');
  console.log(`Upgraded Glasses FeatureGrid`);
}

// =========================================================================
// 5. Upgrade EcommercePetsLayout/StoreFeaturesSection
// =========================================================================
const petsFeaturesFile = path.resolve('components/site/layouts/EcommercePetsLayout/body/components/StoreFeaturesSection/index.tsx');
if (fs.existsSync(petsFeaturesFile)) {
  let code = fs.readFileSync(petsFeaturesFile, 'utf8');
  code = ensureEditableImport(code);
  code = code.replace(
    /<h3 className="text-xl font-bold text-slate-900 mb-2">\s*\{feature\.title\}\s*<\/h3>/,
    `<EditableElement
                      targetId={\`home.features.items.\${index}.title\`}
                      componentKey="StoreFeaturesSection"
                      elementKey="title"
                      label={\`Feature \${index + 1} Title\`}
                      defaultValue={feature.title}
                    >
                      {(val) => (
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {val ?? feature.title}
                        </h3>
                      )}
                    </EditableElement>`
  );
  code = code.replace(
    /<p className="text-slate-600 text-sm font-medium leading-relaxed max-w-\[280px\]">\s*\{feature\.description\}\s*<\/p>/,
    `<EditableElement
                    targetId={\`home.features.items.\${index}.description\`}
                    componentKey="StoreFeaturesSection"
                    elementKey="description"
                    label={\`Feature \${index + 1} Description\`}
                    type="textarea"
                    defaultValue={feature.description}
                  >
                    {(val) => (
                      <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-[280px]">
                        {val ?? feature.description}
                      </p>
                    )}
                  </EditableElement>`
  );
  fs.writeFileSync(petsFeaturesFile, code, 'utf8');
  console.log(`Upgraded Pets StoreFeaturesSection`);
}

// =========================================================================
// 6. Upgrade MediaLayout/FeaturedArticlesSection
// =========================================================================
const mediaArticlesFile = path.resolve('components/site/layouts/MediaLayout/body/components/FeaturedArticlesSection/index.tsx');
if (fs.existsSync(mediaArticlesFile)) {
  let code = fs.readFileSync(mediaArticlesFile, 'utf8');
  code = ensureEditableImport(code);
  code = code.replace(
    /\{articles\.map\(\(art\)\s*=>/,
    '{articles.map((art, idx) =>'
  );
  code = code.replace(
    /<h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-indigo-600 transition-colors">\s*\{art\.name \|\| art\.title\}\s*<\/h3>/,
    `<EditableElement
                            targetId={\`home.featured-articles.items.\${idx}.title\`}
                            componentKey="FeaturedArticlesSection"
                            elementKey="title"
                            label={\`Article \${idx + 1} Title\`}
                            defaultValue={art.name || art.title}
                          >
                            {(val) => (
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
                                {val ?? (art.name || art.title)}
                              </h3>
                            )}
                          </EditableElement>`
  );
  code = code.replace(
    /<p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">\s*\{art\.subtitle\}\s*<\/p>/,
    `<EditableElement
                            targetId={\`home.featured-articles.items.\${idx}.description\`}
                            componentKey="FeaturedArticlesSection"
                            elementKey="description"
                            label={\`Article \${idx + 1} Excerpt\`}
                            type="textarea"
                            defaultValue={art.subtitle}
                          >
                            {(val) => (
                              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                                {val ?? art.subtitle}
                              </p>
                            )}
                          </EditableElement>`
  );
  fs.writeFileSync(mediaArticlesFile, code, 'utf8');
  console.log(`Upgraded Media FeaturedArticlesSection`);
}

// =========================================================================
// 7. Upgrade PropertyManagementLayout/WhyChooseUs
// =========================================================================
const propMgmtFile = path.resolve('components/site/layouts/PropertyManagementLayout/body/components/WhyChooseUs/index.tsx');
if (fs.existsSync(propMgmtFile)) {
  let code = fs.readFileSync(propMgmtFile, 'utf8');
  code = ensureEditableImport(code);
  code = code.replace(
    /<h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3 leading-snug">\s*\{item\.title\}\s*<\/h3>/,
    `<EditableElement
          targetId={\`home.why-choose-us.items.\${index}.title\`}
          componentKey="WhyChooseUs"
          elementKey="title"
          label={\`Value \${index + 1} Title\`}
          defaultValue={item.title}
        >
          {(val) => (
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3 leading-snug">
              {val ?? item.title}
            </h3>
          )}
        </EditableElement>`
  );
  code = code.replace(
    /<p className="text-gray-700 dark:text-gray-300 text-base flex-grow">\s*\{item\.description\}\s*<\/p>/,
    `<EditableElement
          targetId={\`home.why-choose-us.items.\${index}.description\`}
          componentKey="WhyChooseUs"
          elementKey="description"
          label={\`Value \${index + 1} Description\`}
          type="textarea"
          defaultValue={item.description}
        >
          {(val) => (
            <p className="text-gray-700 dark:text-gray-300 text-base flex-grow">
              {val ?? item.description}
            </p>
          )}
        </EditableElement>`
  );
  fs.writeFileSync(propMgmtFile, code, 'utf8');
  console.log(`Upgraded PropertyManagement WhyChooseUs`);
}

// =========================================================================
// 8. Upgrade Security2Layout and SecurityLayout FeaturesSection
// =========================================================================
const secFiles = [
  'components/site/layouts/Security2Layout/body/components/FeaturesSection/index.tsx',
  'components/site/layouts/SecurityLayout/body/components/FeaturesSection/index.tsx',
];

secFiles.forEach((file) => {
  const filePath = path.resolve(file);
  let code = fs.readFileSync(filePath, 'utf8');
  code = ensureEditableImport(code);

  code = code.replace(
    /<h3([^>]*)>\s*\{title\}\s*<\/h3>/,
    `<EditableElement
                      targetId={\`home.features.items.\${idx}.title\`}
                      componentKey="FeaturesSection"
                      elementKey="title"
                      label={\`Feature \${idx + 1} Title\`}
                      defaultValue={title}
                    >
                      {(val) => (
                        <h3$1>
                          {val ?? title}
                        </h3>
                      )}
                    </EditableElement>`
  );

  code = code.replace(
    /<p([^>]*)>\s*\{desc \|\| '([^']+)'\}\s*<\/p>/,
    `<EditableElement
                      targetId={\`home.features.items.\${idx}.description\`}
                      componentKey="FeaturesSection"
                      elementKey="description"
                      label={\`Feature \${idx + 1} Description\`}
                      type="textarea"
                      defaultValue={desc || '$2'}
                    >
                      {(val) => (
                        <p$1>
                          {val ?? (desc || '$2')}
                        </p>
                      )}
                    </EditableElement>`
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`Upgraded Security FeaturesSection in: ${file}`);
});

console.log('\n--- Batch 2 Upgrade Complete! ---');
