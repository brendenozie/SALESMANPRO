const fs = require('fs');
const file = 'components/site/layouts/CompanyPortfolioLightLayout/body/components/HeroSection/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  "import { HeroSlide } from '@/types/typings';",
  "import { HeroSlide } from '@/types/typings';\nimport { EditableElement, useEditableContent } from '@/components/site/EditableElement';"
);

// 2. Add useEditableContent
content = content.replace(
  `export default function HeroSlider({ heroSlides, themeSettings, name }: HeroSliderProps) {
  // 1. Data Handling & Fallbacks`,
  `export default function HeroSlider({ heroSlides, themeSettings, name }: HeroSliderProps) {
  const { isEditorMode, isPreviewMode } = useEditableContent();
  // 1. Data Handling & Fallbacks`
);

// 3. Update resetTimer to pause in editor mode
content = content.replace(
  `  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (slides.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
      }, autoAdvanceDelay);
    }
  }, [slides.length]);`,
  `  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (isEditorMode && !isPreviewMode) return;
    if (slides.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
      }, autoAdvanceDelay);
    }
  }, [slides.length, isEditorMode, isPreviewMode]);`
);

// 4. Add Editor Slide Switcher toolbar
const sectionOpen = '<section id="home" className="relative min-h-[90vh] md:min-h-screen w-full flex items-center overflow-hidden bg-white dark:bg-zinc-950">';
const toolbar = `
      {/* Editor Slide Navigation Toolbar */}
      {isEditorMode && !isPreviewMode && slides.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-900/90 text-white px-3 py-1.5 rounded-full text-xs font-mono shadow-xl border border-zinc-700">
          <span className="text-zinc-400">Edit Slide:</span>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); goTo(idx); }}
              className={\`px-2 py-0.5 rounded \${current === idx ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}\`}
            >
              #{idx + 1}
            </button>
          ))}
        </div>
      )}
`;
if (content.includes(sectionOpen)) {
  content = content.replace(sectionOpen, sectionOpen + toolbar);
} else {
  // Check section tag
  const secIdx = content.indexOf('<section id="home"');
  const secEnd = content.indexOf('>', secIdx);
  const tag = content.substring(secIdx, secEnd + 1);
  content = content.replace(tag, tag + toolbar);
}

// 5. Wrap Image
content = content.replace(
  `<Image decoding="async"
            src={currentSlide.imageUrl || '/fallback-logistics.jpg'}
            alt={name || "Trading Commodity Operations"}
            fill
            priority
            className="object-cover object-right lg:object-center opacity-90 brightness-95 contrast-[1.02] transition-all duration-700"
          />`,
  `<EditableElement
            targetId={\`company-portfolio-light.home.hero.slide\${current}.imageUrl\`}
            componentKey="HeroSlider"
            elementKey="imageUrl"
            label={\`Hero Slide #\${current + 1} Image\`}
            type="image"
            defaultValue={currentSlide.imageUrl || '/fallback-logistics.jpg'}
          >
            {(resolvedImg) => (
              <Image decoding="async"
                src={resolvedImg || '/fallback-logistics.jpg'}
                alt={name || "Trading Commodity Operations"}
                fill
                priority
                className="object-cover object-right lg:object-center opacity-90 brightness-95 contrast-[1.02] transition-all duration-700"
              />
            )}
          </EditableElement>`
);

// 6. Wrap badgeText
content = content.replace(
  `<span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: systemAccent }}>
                {currentSlide.badgeText || "Global Physical Execution"}
              </span>`,
  `<EditableElement
                targetId={\`company-portfolio-light.home.hero.slide\${current}.badgeText\`}
                componentKey="HeroSlider"
                elementKey="badgeText"
                label={\`Hero Slide #\${current + 1} Badge\`}
                type="text"
                defaultValue={currentSlide.badgeText || "Global Physical Execution"}
                inline
              >
                {(val) => (
                  <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: systemAccent }}>
                    {val}
                  </span>
                )}
              </EditableElement>`
);

// 7. Wrap headline
const oldHeadline = `<motion.h1 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-[1.1] tracking-tight uppercase max-w-4xl"
            >
              {currentSlide.headline?.split('\\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line.includes('$') ? (
                    <>
                      <span className="text-zinc-500 font-light italic normal-case tracking-normal block sm:inline">
                        {line.split('$')[1]}
                      </span>
                    </>
                  ) : (
                    line
                  )}
                  <br className="hidden sm:inline" />
                </React.Fragment>
              ))}
            </motion.h1>`;

const newHeadline = `<EditableElement
              targetId={\`company-portfolio-light.home.hero.slide\${current}.headline\`}
              componentKey="HeroSlider"
              elementKey="headline"
              label={\`Hero Slide #\${current + 1} Headline\`}
              type="textarea"
              defaultValue={currentSlide.headline || ''}
              inline
            >
              {(val) => (
                <motion.h1 
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-[1.1] tracking-tight uppercase max-w-4xl"
                >
                  {val?.split('\\n').map((line: string, i: number) => (
                    <React.Fragment key={i}>
                      {line.includes('$') ? (
                        <>
                          <span className="text-zinc-500 font-light italic normal-case tracking-normal block sm:inline">
                            {line.split('$')[1]}
                          </span>
                        </>
                      ) : (
                        line
                      )}
                      <br className="hidden sm:inline" />
                    </React.Fragment>
                  ))}
                </motion.h1>
              )}
            </EditableElement>`;

if (content.includes(oldHeadline)) {
  content = content.replace(oldHeadline, newHeadline);
} else {
  console.log('Headline pattern mismatch, checking alternatives...');
}

// 8. Wrap subline
const oldSubline = `<motion.p 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="text-zinc-600 dark:text-zinc-300 text-base md:text-lg max-w-xl leading-relaxed font-light border-l border-zinc-300 dark:border-zinc-800 pl-6 text-justify"
            >
              {currentSlide.subline}
            </motion.p>`;

const newSubline = `<EditableElement
              targetId={\`company-portfolio-light.home.hero.slide\${current}.subline\`}
              componentKey="HeroSlider"
              elementKey="subline"
              label={\`Hero Slide #\${current + 1} Subline\`}
              type="textarea"
              defaultValue={currentSlide.subline || ''}
              inline
            >
              {(val) => (
                <motion.p 
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  className="text-zinc-600 dark:text-zinc-300 text-base md:text-lg max-w-xl leading-relaxed font-light border-l border-zinc-300 dark:border-zinc-800 pl-6 text-justify"
                >
                  {val}
                </motion.p>
              )}
            </EditableElement>`;

if (content.includes(oldSubline)) {
  content = content.replace(oldSubline, newSubline);
}

// 9. Wrap ctaText
content = content.replace(
  `<span>{currentSlide.ctaText || "Review Infrastructure"}</span>`,
  `<EditableElement
                  targetId={\`company-portfolio-light.home.hero.slide\${current}.ctaText\`}
                  componentKey="HeroSlider"
                  elementKey="ctaText"
                  label={\`Hero Slide #\${current + 1} CTA Text\`}
                  type="text"
                  defaultValue={currentSlide.ctaText || "Review Infrastructure"}
                  inline
                >
                  {(val) => <span>{val}</span>}
                </EditableElement>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated CompanyPortfolioLight HeroSection');
