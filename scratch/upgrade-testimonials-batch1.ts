import fs from 'fs';
import path from 'path';

// Helper to replace or insert imports
function ensureEditableElementImport(code: string): string {
  if (code.includes('EditableElement')) return code;
  // Insert import at the top after 'use client'
  if (code.startsWith("'use client'") || code.startsWith('"use client"')) {
    const lines = code.split('\n');
    lines.splice(1, 0, "import { EditableElement } from '@/contexts/EditableContentContext';");
    return lines.join('\n');
  }
  return "import { EditableElement } from '@/contexts/EditableContentContext';\n" + code;
}

interface UpgradeTask {
  filePath: string;
  name: string;
  transform: (code: string) => string;
}

const tasks: UpgradeTask[] = [
  // 1. EcommerceAccessoriesLayout
  {
    name: 'EcommerceAccessoriesLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceAccessoriesLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Header badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-zinc-600 dark:text-zinc-400">Driver Telemetry<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Driver Telemetry"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 dark:text-zinc-400">Driver Telemetry</span></EditableElement>'
      );
      // Header title
      c = c.replace(
        /<h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-\[0\.9\] tracking-tighter uppercase italic drop-shadow-sm">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Verified Track Records"><h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter uppercase italic drop-shadow-sm">$1</h2></EditableElement>'
      );
      // Header description
      c = c.replace(
        /<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-loose max-w-md ml-auto">([\s\S]*?)<\/p>/,
        '<EditableElement targetId="home.testimonials.description" label="Section Description" type="textarea" defaultValue="Real-world performance data from our active drivers, mechanics, and tuning partners across the East African auto sector."><p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-loose max-w-md ml-auto">$1</p></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<blockquote className="([^"]*?)">\s*"\{t\.quote\}"\s*<\/blockquote>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><blockquote className="$1">"{t.quote}"</blockquote></EditableElement>'
      );
      // Author name
      c = c.replace(
        /<h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none mb-1\.5">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none mb-1.5">{t.authorName}</h4></EditableElement>'
      );
      // Role
      c = c.replace(
        /<p className="text-\[10px\] font-bold uppercase tracking-widest transition-colors duration-500" style=\{\{ color: primaryColor \}\}>\s*Verified Tuner\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.role`} label={`Testimonial ${index + 1} Role`} defaultValue="Verified Tuner"><p className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500" style={{ color: primaryColor }}>Verified Tuner</p></EditableElement>'
      );
      return c;
    },
  },

  // 2. EcommerceBabyLayout
  {
    name: 'EcommerceBabyLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceBabyLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[11px\] font-black uppercase tracking-\[0\.4em\] text-zinc-400">Trusted by Parents<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Trusted by Parents"><span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">Trusted by Parents</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-\[0\.95\] tracking-tighter">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Real Stories from The Nursery"><h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-[0.95] tracking-tighter">$1</h2></EditableElement>'
      );
      // Description
      c = c.replace(
        /<p className="text-xl text-zinc-500 font-medium leading-relaxed">([\s\S]*?)<\/p>/,
        '<EditableElement targetId="home.testimonials.description" label="Section Description" type="textarea" defaultValue="There’s nothing more precious than your baby’s comfort. Hear why thousands of families choose us for their first moments."><p className="text-xl text-zinc-500 font-medium leading-relaxed">$1</p></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<blockquote className="text-2xl text-zinc-900 dark:text-white font-bold leading-tight tracking-tight mb-8">\s*“\{t\.quote\}”\s*<\/blockquote>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><blockquote className="text-2xl text-zinc-900 dark:text-white font-bold leading-tight tracking-tight mb-8">“{t.quote}”</blockquote></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-lg font-black text-zinc-900 dark:text-white leading-none mb-1">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-lg font-black text-zinc-900 dark:text-white leading-none mb-1">{t.authorName}</h4></EditableElement>'
      );
      // Role
      c = c.replace(
        /<p className="text-\[10px\] font-black text-zinc-400 uppercase tracking-widest">\s*Verified Parent\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.role`} label={`Testimonial ${index + 1} Role`} defaultValue="Verified Parent"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Verified Parent</p></EditableElement>'
      );
      return c;
    },
  },

  // 3. EcommerceBookLayout
  {
    name: 'EcommerceBookLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceBookLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black tracking-\[0\.4em\] text-amber-500 uppercase">Reader Accolades<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Reader Accolades"><span className="text-[10px] font-black tracking-[0.4em] text-amber-500 uppercase">Reader Accolades</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-serif text-stone-900 dark:text-stone-100 leading-tight">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Literary Resonance"><h2 className="text-4xl md:text-6xl font-serif text-stone-900 dark:text-stone-100 leading-tight">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 font-serif italic leading-relaxed mb-8">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 font-serif italic leading-relaxed mb-8">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 4. EcommerceCakeLayout
  {
    name: 'EcommerceCakeLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceCakeLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[11px\] font-black uppercase tracking-\[0\.4em\] text-amber-600 dark:text-amber-400">Sweet Accolades<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Sweet Accolades"><span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-600 dark:text-amber-400">Sweet Accolades</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Taste The Joy"><h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-8">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-8">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 5. EcommerceEarphonesLayout
  {
    name: 'EcommerceEarphonesLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceEarphonesLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-zinc-400">Audio Critiques<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Audio Critiques"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Audio Critiques</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Acoustic Fidelity"><h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 6. EcommerceFlowersLayout
  {
    name: 'EcommerceFlowersLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceFlowersLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black tracking-\[0\.4em\] uppercase text-emerald-700 dark:text-emerald-400">Botanical Praise<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Botanical Praise"><span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-700 dark:text-emerald-400">Botanical Praise</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-zinc-100">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="In Full Bloom"><h2 className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-zinc-100">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-8">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-8">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 7. EcommerceGamingLayout
  {
    name: 'EcommerceGamingLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceGamingLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-emerald-400">Player Commendations<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Player Commendations"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Player Commendations</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-black text-zinc-100 uppercase tracking-tighter">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Battle Tested"><h2 className="text-4xl md:text-6xl font-black text-zinc-100 uppercase tracking-tighter">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-base text-zinc-300 leading-relaxed font-medium mb-8 italic">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-base text-zinc-300 leading-relaxed font-medium mb-8 italic">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-widest text-zinc-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-widest text-zinc-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 8. EcommerceGroceriesLayout
  {
    name: 'EcommerceGroceriesLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceGroceriesLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-emerald-700 dark:text-emerald-400">Fresh Feedback<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Fresh Feedback"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-700 dark:text-emerald-400">Fresh Feedback</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Farm To Table Trust"><h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 9. EcommerceHardwareLayout
  {
    name: 'EcommerceHardwareLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceHardwareLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-amber-500">Contractor Reviews<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Contractor Reviews"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Contractor Reviews</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Job Site Proven"><h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 10. EcommerceHoneyLayout
  {
    name: 'EcommerceHoneyLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceHoneyLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-amber-500">Apiary Stories<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Apiary Stories"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Apiary Stories</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-serif text-stone-900 dark:text-stone-100">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Pure Nature"><h2 className="text-4xl md:text-6xl font-serif text-stone-900 dark:text-stone-100">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-lg text-stone-700 dark:text-stone-300 font-serif italic leading-relaxed mb-8">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-lg text-stone-700 dark:text-stone-300 font-serif italic leading-relaxed mb-8">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-stone-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-stone-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 11. EcommerceLayout
  {
    name: 'EcommerceLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = code;
      // Section title
      c = c.replace(
        /<motion\.h2[^>]*>([\s\S]*?)<\/motion\.h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Loved by Thousands"><motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">$1</motion.h2></EditableElement>'
      );
      // Legacy target replacements
      c = c.replace(
        /targetId=\{`TestimonialsSection\.testimonial\.\$\{idx\}\.quote`\}/g,
        'targetId={`home.testimonials.items.${idx}.quote`}'
      );
      c = c.replace(
        /targetId=\{`TestimonialsSection\.testimonial\.\$\{idx\}\.authorName`\}/g,
        'targetId={`home.testimonials.items.${idx}.authorName`}'
      );
      return c;
    },
  },

  // 12. EcommerceMeatLayout
  {
    name: 'EcommerceMeatLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceMeatLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Customer Proof"><h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 italic mb-6 leading-relaxed">\s*"\{testimonial\.text\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={testimonial.text}><p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 italic mb-6 leading-relaxed">"{testimonial.text}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h3 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">\s*\{testimonial\.name\}\s*<\/h3>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={testimonial.name}><h3 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">{testimonial.name}</h3></EditableElement>'
      );
      // Role
      c = c.replace(
        /<p className="text-xs text-zinc-500 font-medium">\s*\{testimonial\.role\}\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.role`} label={`Testimonial ${index + 1} Role`} defaultValue={testimonial.role}><p className="text-xs text-zinc-500 font-medium">{testimonial.role}</p></EditableElement>'
      );
      return c;
    },
  },

  // 13. EcommerceMotorCycleLayout
  {
    name: 'EcommerceMotorCycleLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceMotorCycleLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-orange-500">Rider Dispatches<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Rider Dispatches"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Rider Dispatches</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Road Tested"><h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 14. EcommercePeanutsLayout
  {
    name: 'EcommercePeanutsLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommercePeanutsLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-amber-600">Nutty Reviews<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Nutty Reviews"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">Nutty Reviews</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-black text-stone-900 dark:text-stone-100">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Roasted Perfection"><h2 className="text-4xl md:text-6xl font-black text-stone-900 dark:text-stone-100">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-base text-stone-600 dark:text-stone-300 leading-relaxed font-medium mb-8 italic">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-base text-stone-600 dark:text-stone-300 leading-relaxed font-medium mb-8 italic">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-stone-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-stone-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 15. EcommercePetsLayout
  {
    name: 'EcommercePetsLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommercePetsLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-emerald-500">Pet Parent Love<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Pet Parent Love"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Pet Parent Love</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Happy Tails"><h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8 italic">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 16. EcommerceWatchLayout
  {
    name: 'EcommerceWatchLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceWatchLayout/body/components/TestimonialsSection/TestimonialsSection.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Badge
      c = c.replace(
        /<span className="text-\[10px\] font-black uppercase tracking-\[0\.4em\] text-amber-500">Horology Chronicles<\/span>/,
        '<EditableElement targetId="home.testimonials.badge" label="Badge Text" defaultValue="Horology Chronicles"><span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Horology Chronicles</span></EditableElement>'
      );
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-zinc-100">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Timeless Accolades"><h2 className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-zinc-100">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-8">\s*"\{t\.quote\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-8">"{t.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">\s*\{t\.authorName\}\s*<\/h4>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{t.authorName}</h4></EditableElement>'
      );
      return c;
    },
  },

  // 17. EcommerceAgrovetLayout
  {
    name: 'EcommerceAgrovetLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EcommerceAgrovetLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">([\s\S]*?)<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Farmer Testimonials"><h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">$1</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 italic mb-6 leading-relaxed">\s*"\{testimonial\.text\}"\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={testimonial.text}><p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 italic mb-6 leading-relaxed">"{testimonial.text}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<h3 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">\s*\{testimonial\.name\}\s*<\/h3>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={testimonial.name}><h3 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">{testimonial.name}</h3></EditableElement>'
      );
      // Role
      c = c.replace(
        /<p className="text-xs text-zinc-500 font-medium">\s*\{testimonial\.role\}\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.role`} label={`Testimonial ${index + 1} Role`} defaultValue={testimonial.role}><p className="text-xs text-zinc-500 font-medium">{testimonial.role}</p></EditableElement>'
      );
      return c;
    },
  },

  // 18. Automotive2Layout TestimonialsSection
  {
    name: 'Automotive2Layout/TestimonialsSection',
    filePath: 'components/site/layouts/Automotive2Layout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<motion\.h2[^>]*>([\s\S]*?)<\/motion\.h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="What Our Happy Customers Say"><motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8 }} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">$1</motion.h2></EditableElement>'
      );
      // Description
      c = c.replace(
        /<motion\.p[^>]*>([\s\S]*?)<\/motion\.p>/,
        '<EditableElement targetId="home.testimonials.description" label="Section Description" type="textarea" defaultValue="Hear directly from users who have found their perfect ride or successfully sold their vehicles with us."><motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">$1</motion.p></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-gray-700 italic mb-6 text-lg">"\{testimonial\.quote\}"<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={testimonial.quote}><p className="text-gray-700 italic mb-6 text-lg">"{testimonial.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<p className="font-semibold text-gray-900 text-lg">\s*\{testimonial\.author\}\s*<span className="block text-gray-500 text-sm font-normal">\s*\{testimonial\.location\}\s*<\/span>\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={testimonial.author}><p className="font-semibold text-gray-900 text-lg">{testimonial.author}<span className="block text-gray-500 text-sm font-normal"><EditableElement targetId={`home.testimonials.items.${index}.role`} label={`Testimonial ${index + 1} Location`} defaultValue={testimonial.location}><span>{testimonial.location}</span></EditableElement></span></p></EditableElement>'
      );
      return c;
    },
  },

  // 19. AutomotiveLayout TestimonialsSection
  {
    name: 'AutomotiveLayout/TestimonialsSection',
    filePath: 'components/site/layouts/AutomotiveLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<motion\.h2[^>]*>([\s\S]*?)<\/motion\.h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="What Our Happy Customers Say"><motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8 }} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">$1</motion.h2></EditableElement>'
      );
      // Description
      c = c.replace(
        /<motion\.p[^>]*>([\s\S]*?)<\/motion\.p>/,
        '<EditableElement targetId="home.testimonials.description" label="Section Description" type="textarea" defaultValue="Hear directly from users who have found their perfect ride or successfully sold their vehicles with us."><motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">$1</motion.p></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-gray-700 italic mb-6 text-lg">"\{testimonial\.quote\}"<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={testimonial.quote}><p className="text-gray-700 italic mb-6 text-lg">"{testimonial.quote}"</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<p className="font-semibold text-gray-900 text-lg">\s*\{testimonial\.author\}\s*<span className="block text-gray-500 text-sm font-normal">\s*\{testimonial\.location\}\s*<\/span>\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={testimonial.author}><p className="font-semibold text-gray-900 text-lg">{testimonial.author}<span className="block text-gray-500 text-sm font-normal"><EditableElement targetId={`home.testimonials.items.${index}.role`} label={`Testimonial ${index + 1} Location`} defaultValue={testimonial.location}><span>{testimonial.location}</span></EditableElement></span></p></EditableElement>'
      );
      return c;
    },
  },

  // 20. ConsultancyLayout TestimonialsSection
  {
    name: 'ConsultancyLayout/TestimonialsSection',
    filePath: 'components/site/layouts/ConsultancyLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<motion\.h2[^>]*>([\s\S]*?)<\/motion\.h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="What Clients Are Saying"><motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-4xl md:text-5xl font-extrabold text-white mb-6">$1</motion.h2></EditableElement>'
      );
      // Description
      c = c.replace(
        /<motion\.p[^>]*>([\s\S]*?)<\/motion\.p>/,
        '<EditableElement targetId="home.testimonials.description" label="Section Description" type="textarea" defaultValue="Real stories of transformation, growth, and empowerment from individuals who’ve worked with Brenden."><motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto mb-16">$1</motion.p></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-lg italic leading-relaxed text-gray-700 mb-6">\s*“\{item\.quote\}”\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={item.quote}><p className="text-lg italic leading-relaxed text-gray-700 mb-6">“{item.quote}”</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<p className="font-bold text-gray-900 text-lg">\{item\.author\}<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={item.author}><p className="font-bold text-gray-900 text-lg">{item.author}</p></EditableElement>'
      );
      // Role
      c = c.replace(
        /<p className="text-sm text-gray-500">\{item\.title\}<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.role`} label={`Testimonial ${index + 1} Role`} defaultValue={item.title}><p className="text-sm text-gray-500">{item.title}</p></EditableElement>'
      );
      return c;
    },
  },

  // 21. DeliveryLayout TestimonialsSection
  {
    name: 'DeliveryLayout/TestimonialsSection',
    filePath: 'components/site/layouts/DeliveryLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<motion\.h2[^>]*>([\s\S]*?)<\/motion\.h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="What Clients Are Saying"><motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-4xl md:text-5xl font-extrabold text-white mb-6">$1</motion.h2></EditableElement>'
      );
      // Description
      c = c.replace(
        /<motion\.p[^>]*>([\s\S]*?)<\/motion\.p>/,
        '<EditableElement targetId="home.testimonials.description" label="Section Description" type="textarea" defaultValue="Real stories of transformation, growth, and empowerment from individuals who’ve worked with Brenden."><motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto mb-16">$1</motion.p></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-lg italic leading-relaxed text-gray-700 mb-6">\s*“\{item\.quote\}”\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={item.quote}><p className="text-lg italic leading-relaxed text-gray-700 mb-6">“{item.quote}”</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<p className="font-bold text-gray-900 text-lg">\{item\.author\}<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={item.author}><p className="font-bold text-gray-900 text-lg">{item.author}</p></EditableElement>'
      );
      // Role
      c = c.replace(
        /<p className="text-sm text-gray-500">\{item\.title\}<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.role`} label={`Testimonial ${index + 1} Role`} defaultValue={item.title}><p className="text-sm text-gray-500">{item.title}</p></EditableElement>'
      );
      return c;
    },
  },

  // 22. PublicSpeakingLayout TestimonialsSection
  {
    name: 'PublicSpeakingLayout/TestimonialsSection',
    filePath: 'components/site/layouts/PublicSpeakingLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<motion\.h2[^>]*>([\s\S]*?)<\/motion\.h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="What Audiences Are Saying"><motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-4xl md:text-5xl font-extrabold text-white mb-6">$1</motion.h2></EditableElement>'
      );
      // Description
      c = c.replace(
        /<motion\.p[^>]*>([\s\S]*?)<\/motion\.p>/,
        '<EditableElement targetId="home.testimonials.description" label="Section Description" type="textarea" defaultValue="Real stories of impact and transformation from organizations and event organizers."><motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto mb-16">$1</motion.p></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-lg italic leading-relaxed text-gray-700 mb-6">\s*“\{item\.quote\}”\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={item.quote}><p className="text-lg italic leading-relaxed text-gray-700 mb-6">“{item.quote}”</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<p className="font-bold text-gray-900 text-lg">\{item\.author\}<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={item.author}><p className="font-bold text-gray-900 text-lg">{item.author}</p></EditableElement>'
      );
      // Role
      c = c.replace(
        /<p className="text-sm text-gray-500">\{item\.title\}<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.role`} label={`Testimonial ${index + 1} Role`} defaultValue={item.title}><p className="text-sm text-gray-500">{item.title}</p></EditableElement>'
      );
      return c;
    },
  },

  // 23. PropertyManagementLayout TestimonialsSection
  {
    name: 'PropertyManagementLayout/TestimonialsSection',
    filePath: 'components/site/layouts/PropertyManagementLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<motion\.h2[^>]*>([\s\S]*?)<\/motion\.h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Hear From Our Happy Clients"><motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative" variants={headingVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>$1</motion.h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="italic text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">\s*“\{t\.quote\}”\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${idx}.quote`} label={`Testimonial ${idx + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="italic text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">“{t.quote}”</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<span className="block font-bold text-gray-900 dark:text-gray-50 text-lg">\s*—\s*\{t\.author\}\s*<\/span>/,
        '<EditableElement targetId={`home.testimonials.items.${idx}.author`} label={`Testimonial ${idx + 1} Author`} defaultValue={t.author}><span className="block font-bold text-gray-900 dark:text-gray-50 text-lg">— {t.author}</span></EditableElement>'
      );
      // Role
      c = c.replace(
        /<span className="block text-gray-500 dark:text-gray-400 text-sm mt-1">\s*\{t\.role\}\s*<\/span>/,
        '<EditableElement targetId={`home.testimonials.items.${idx}.role`} label={`Testimonial ${idx + 1} Role`} defaultValue={t.role}><span className="block text-gray-500 dark:text-gray-400 text-sm mt-1">{t.role}</span></EditableElement>'
      );
      return c;
    },
  },

  // 24. RealEstateLayout TestimonialsSection
  {
    name: 'RealEstateLayout/TestimonialsSection',
    filePath: 'components/site/layouts/RealEstateLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      // Upgrade targets to canonical home.testimonials.items.${idx}
      c = c.replace(/targetId=\{`realestate\.home\.testimonials\.\$\{testId\}\.avatar`\}/g, 'targetId={`home.testimonials.items.${idx}.avatar`}');
      c = c.replace(/targetId=\{`realestate\.home\.testimonials\.\$\{testId\}\.quote`\}/g, 'targetId={`home.testimonials.items.${idx}.quote`}');
      c = c.replace(/targetId=\{`realestate\.home\.testimonials\.\$\{testId\}\.author`\}/g, 'targetId={`home.testimonials.items.${idx}.author`}');
      c = c.replace(/targetId=\{`realestate\.home\.testimonials\.\$\{testId\}\.role`\}/g, 'targetId={`home.testimonials.items.${idx}.role`}');
      return c;
    },
  },

  // 25. BarbershopBookingsLayout TestimonialsSection
  {
    name: 'BarbershopBookingsLayout/TestimonialsSection',
    filePath: 'components/site/layouts/BarbershopBookingsLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId=\{isActive \? "barbershop\.home\.testimonials\.quote" : `barbershop\.home\.testimonials\.quote\$\{cardIndex \?\? 0\}`\}/g, 'targetId={`home.testimonials.items.${cardIndex ?? 0}.quote`}');
      c = c.replace(/targetId=\{isActive \? "barbershop\.home\.testimonials\.avatar" : `barbershop\.home\.testimonials\.avatar\$\{cardIndex \?\? 0\}`\}/g, 'targetId={`home.testimonials.items.${cardIndex ?? 0}.avatar`}');
      c = c.replace(/targetId=\{isActive \? "barbershop\.home\.testimonials\.author" : `barbershop\.home\.testimonials\.author\$\{cardIndex \?\? 0\}`\}/g, 'targetId={`home.testimonials.items.${cardIndex ?? 0}.author`}');
      c = c.replace(/targetId=\{isActive \? "barbershop\.home\.testimonials\.role" : `barbershop\.home\.testimonials\.role\$\{cardIndex \?\? 0\}`\}/g, 'targetId={`home.testimonials.items.${cardIndex ?? 0}.role`}');
      return c;
    },
  },

  // 26. SalonBookingsLayout TestimonialsSection
  {
    name: 'SalonBookingsLayout/TestimonialsSection',
    filePath: 'components/site/layouts/SalonBookingsLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId=\{`salon\.home\.testimonials\.item\$\{index\}\.quote`\}/g, 'targetId={`home.testimonials.items.${index}.quote`}');
      c = c.replace(/targetId=\{`salon\.home\.testimonials\.item\$\{index\}\.avatar`\}/g, 'targetId={`home.testimonials.items.${index}.avatar`}');
      c = c.replace(/targetId=\{`salon\.home\.testimonials\.item\$\{index\}\.author`\}/g, 'targetId={`home.testimonials.items.${index}.author`}');
      return c;
    },
  },

  // 27. BookingsLayout TestimonialsSection
  {
    name: 'BookingsLayout/TestimonialsSection',
    filePath: 'components/site/layouts/BookingsLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/const TestimonialCard = \(\{ testimonial, primaryColor \}: \{ testimonial: typeof staticTestimonials\[0\], primaryColor: string \}\)/, 'const TestimonialCard = ({ testimonial, primaryColor, index = 0 }: { testimonial: typeof staticTestimonials[0], primaryColor: string, index?: number })');
      c = c.replace(/targetId="bookings\.home\.testimonials\.quote"/g, 'targetId={`home.testimonials.items.${index}.quote`}');
      c = c.replace(/<TestimonialCard testimonial=\{t\} primaryColor=\{primaryColor\} \/>/g, '<TestimonialCard testimonial={t} primaryColor={primaryColor} index={idx} />');
      return c;
    },
  },

  // 28. DrycleaningBookingsLayout TestimonialsSection
  {
    name: 'DrycleaningBookingsLayout/TestimonialsSection',
    filePath: 'components/site/layouts/DrycleaningBookingsLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId="drycleaning\.home\.testimonials\.quote"/g, 'targetId={`home.testimonials.items.${index}.quote`}');
      c = c.replace(/targetId="drycleaning\.home\.testimonials\.authorName"/g, 'targetId={`home.testimonials.items.${index}.authorName`}');
      c = c.replace(/targetId="drycleaning\.home\.testimonials\.role"/g, 'targetId={`home.testimonials.items.${index}.role`}');
      // Wrap avatar
      c = c.replace(
        /<img\s+src=\{testimonial\.avatarUrl\}\s+alt=\{testimonial\.authorName\}\s+className="w-full h-full object-cover"\s*\/>/,
        '<EditableElement targetId={`home.testimonials.items.${index}.avatar`} label="Author Avatar" type="image"><img src={testimonial.avatarUrl} alt={testimonial.authorName} className="w-full h-full object-cover" /></EditableElement>'
      );
      return c;
    },
  },

  // 29. CompanyPortfolioLayout TestimonialsNewsSection
  {
    name: 'CompanyPortfolioLayout/TestimonialsNewsSection',
    filePath: 'components/site/layouts/CompanyPortfolioLayout/body/components/TestimonialsNewsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId=\{`company-portfolio\.home\.testimonials\.item\$\{index\}\.quote`\}/g, 'targetId={`home.testimonials.items.${index}.quote`}');
      c = c.replace(/targetId=\{`company-portfolio\.home\.testimonials\.item\$\{index\}\.authorName`\}/g, 'targetId={`home.testimonials.items.${index}.authorName`}');
      c = c.replace(/targetId=\{`company-portfolio\.home\.testimonials\.item\$\{index\}\.role`\}/g, 'targetId={`home.testimonials.items.${index}.role`}');
      return c;
    },
  },

  // 30. CompanyPortfolioLightLayout TestimonialsNewsSection
  {
    name: 'CompanyPortfolioLightLayout/TestimonialsNewsSection',
    filePath: 'components/site/layouts/CompanyPortfolioLightLayout/body/components/TestimonialsNewsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId=\{`company-portfolio\.home\.testimonials\.item\$\{index\}\.quote`\}/g, 'targetId={`home.testimonials.items.${index}.quote`}');
      c = c.replace(/targetId=\{`company-portfolio\.home\.testimonials\.item\$\{index\}\.authorName`\}/g, 'targetId={`home.testimonials.items.${index}.authorName`}');
      c = c.replace(/targetId=\{`company-portfolio\.home\.testimonials\.item\$\{index\}\.role`\}/g, 'targetId={`home.testimonials.items.${index}.role`}');
      return c;
    },
  },

  // 31. CoursesLayout TestimonialsSection
  {
    name: 'CoursesLayout/TestimonialsSection',
    filePath: 'components/site/layouts/CoursesLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId=\{`courses\.home\.testimonials\.testimonial\$\{idx\}\.quote`\}/g, 'targetId={`home.testimonials.items.${idx}.quote`}');
      c = c.replace(/targetId=\{`courses\.home\.testimonials\.testimonial\$\{idx\}\.avatar`\}/g, 'targetId={`home.testimonials.items.${idx}.avatar`}');
      c = c.replace(/targetId=\{`courses\.home\.testimonials\.testimonial\$\{idx\}\.author`\}/g, 'targetId={`home.testimonials.items.${idx}.author`}');
      c = c.replace(/targetId=\{`courses\.home\.testimonials\.testimonial\$\{idx\}\.role`\}/g, 'targetId={`home.testimonials.items.${idx}.role`}');
      return c;
    },
  },

  // 32. CoursesLayout2 TestimonialsSection
  {
    name: 'CoursesLayout2/TestimonialsSection',
    filePath: 'components/site/layouts/CoursesLayout2/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId="courses2\.home\.testimonials\.quote"/g, 'targetId={`home.testimonials.items.${index}.quote`}');
      c = c.replace(/targetId="courses2\.home\.testimonials\.avatar"/g, 'targetId={`home.testimonials.items.${index}.avatar`}');
      c = c.replace(/targetId="courses2\.home\.testimonials\.author"/g, 'targetId={`home.testimonials.items.${index}.author`}');
      c = c.replace(/targetId="courses2\.home\.testimonials\.role"/g, 'targetId={`home.testimonials.items.${index}.role`}');
      return c;
    },
  },

  // 33. CoursesLayout3 TestimonialsSection
  {
    name: 'CoursesLayout3/TestimonialsSection',
    filePath: 'components/site/layouts/CoursesLayout3/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId="courses3\.home\.testimonials\.quote"/g, 'targetId={`home.testimonials.items.${currentIndex}.quote`}');
      c = c.replace(/targetId="courses3\.home\.testimonials\.avatar"/g, 'targetId={`home.testimonials.items.${currentIndex}.avatar`}');
      c = c.replace(/targetId="courses3\.home\.testimonials\.author"/g, 'targetId={`home.testimonials.items.${currentIndex}.author`}');
      c = c.replace(/targetId="courses3\.home\.testimonials\.role"/g, 'targetId={`home.testimonials.items.${currentIndex}.role`}');
      return c;
    },
  },

  // 34. EventsLayout TestimonialsSection
  {
    name: 'EventsLayout/TestimonialsSection',
    filePath: 'components/site/layouts/EventsLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId=\{`events\.home\.testimonials\.item\$\{index\}\.quote`\}/g, 'targetId={`home.testimonials.items.${index}.quote`}');
      c = c.replace(/targetId=\{`events\.home\.testimonials\.item\$\{index\}\.authorName`\}/g, 'targetId={`home.testimonials.items.${index}.authorName`}');
      return c;
    },
  },

  // 35. FitnessLayout TestimonialsSection
  {
    name: 'FitnessLayout/TestimonialsSection',
    filePath: 'components/site/layouts/FitnessLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId=\{page === 0 \? "fitness\.home\.testimonials\.quote" : `fitness\.home\.testimonials\.item\$\{page\}\.quote`\}/g, 'targetId={`home.testimonials.items.${page}.quote`}');
      c = c.replace(/targetId=\{page === 0 \? "fitness\.home\.testimonials\.author" : `fitness\.home\.testimonials\.item\$\{page\}\.author`\}/g, 'targetId={`home.testimonials.items.${page}.author`}');
      c = c.replace(/targetId=\{page === 0 \? "fitness\.home\.testimonials\.role" : `fitness\.home\.testimonials\.item\$\{page\}\.role`\}/g, 'targetId={`home.testimonials.items.${page}.role`}');
      return c;
    },
  },

  // 36. SaaSLayout EnhancedTestimonialsSection
  {
    name: 'SaaSLayout/EnhancedTestimonialsSection',
    filePath: 'components/site/layouts/SaaSLayout/body/components/EnhancedTestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      // Wrap grid quote
      c = c.replace(
        /<p className="italic text-gray-700 dark:text-gray-200 mb-4 flex-1 z-10">\s*“\{t\.quote\}”\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${i}.quote`} label={`Testimonial ${i + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="italic text-gray-700 dark:text-gray-200 mb-4 flex-1 z-10">“{t.quote}”</p></EditableElement>'
      );
      // Wrap grid author
      c = c.replace(
        /<span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">\s*—\s*\{t\.author\}\s*<\/span>/,
        '<EditableElement targetId={`home.testimonials.items.${i}.author`} label={`Testimonial ${i + 1} Author`} defaultValue={t.author}><span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">— {t.author}</span></EditableElement>'
      );
      // Wrap grid role
      c = c.replace(
        /<span className="text-sm text-gray-500 dark:text-gray-400">\s*\{t\.role\}\s*\{t\.company && `,\s*\$\{t\.company\}`\}\s*<\/span>/,
        '<EditableElement targetId={`home.testimonials.items.${i}.role`} label={`Testimonial ${i + 1} Role`} defaultValue={t.role}><span className="text-sm text-gray-500 dark:text-gray-400">{t.role}{t.company && `, ${t.company}`}</span></EditableElement>'
      );
      return c;
    },
  },

  // 37. SecurityLayout TestimonialsSection
  {
    name: 'SecurityLayout/TestimonialsSection',
    filePath: 'components/site/layouts/SecurityLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-\[1\.1\]">\s*Proven Security Case Success\s*<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Proven Security Case Success"><h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">Proven Security Case Success</h2></EditableElement>'
      );
      // Description
      c = c.replace(
        /<p className="mt-6 text-xs text-gray-500 leading-relaxed max-w-sm">([\s\S]*?)<\/p>/,
        '<EditableElement targetId="home.testimonials.description" label="Section Description" type="textarea" defaultValue="Verifiable integration documentation and deployment reviews from platform infrastructure leads who have completely hardened their defensive perimeter posture."><p className="mt-6 text-xs text-gray-500 leading-relaxed max-w-sm">$1</p></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-xs text-gray-600 leading-relaxed font-medium mb-5 transition-colors duration-200 group-hover:text-black">\s*&ldquo;\{t\.text\}&rdquo;\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${idx}.quote`} label={`Testimonial ${idx + 1} Quote`} type="textarea" defaultValue={t.text}><p className="text-xs text-gray-600 leading-relaxed font-medium mb-5 transition-colors duration-200 group-hover:text-black">&ldquo;{t.text}&rdquo;</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<span className="text-xs font-bold tracking-tight text-gray-900">\s*\{t\.authorName\}\s*<\/span>/,
        '<EditableElement targetId={`home.testimonials.items.${idx}.author`} label={`Testimonial ${idx + 1} Author`} defaultValue={t.authorName}><span className="text-xs font-bold tracking-tight text-gray-900">{t.authorName}</span></EditableElement>'
      );
      // Company
      c = c.replace(
        /<span className="text-\[10px\] font-mono text-gray-400 mt-0\.5">\s*\{t\.company\}\s*<\/span>/,
        '<EditableElement targetId={`home.testimonials.items.${idx}.role`} label={`Testimonial ${idx + 1} Company`} defaultValue={t.company}><span className="text-[10px] font-mono text-gray-400 mt-0.5">{t.company}</span></EditableElement>'
      );
      return c;
    },
  },

  // 38. Security2Layout TestimonialsSection
  {
    name: 'Security2Layout/TestimonialsSection',
    filePath: 'components/site/layouts/Security2Layout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-\[1\.1\]">\s*Proven Security Case Success\s*<\/h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Proven Security Case Success"><h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">Proven Security Case Success</h2></EditableElement>'
      );
      // Quote
      c = c.replace(
        /<p className="text-xs text-gray-600 leading-relaxed font-medium mb-5 transition-colors duration-200 group-hover:text-black">\s*&ldquo;\{t\.text\}&rdquo;\s*<\/p>/,
        '<EditableElement targetId={`home.testimonials.items.${idx}.quote`} label={`Testimonial ${idx + 1} Quote`} type="textarea" defaultValue={t.text}><p className="text-xs text-gray-600 leading-relaxed font-medium mb-5 transition-colors duration-200 group-hover:text-black">&ldquo;{t.text}&rdquo;</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<span className="text-xs font-bold tracking-tight text-gray-900">\s*\{t\.authorName\}\s*<\/span>/,
        '<EditableElement targetId={`home.testimonials.items.${idx}.author`} label={`Testimonial ${idx + 1} Author`} defaultValue={t.authorName}><span className="text-xs font-bold tracking-tight text-gray-900">{t.authorName}</span></EditableElement>'
      );
      // Company
      c = c.replace(
        /<span className="text-\[10px\] font-mono text-gray-400 mt-0\.5">\s*\{t\.company\}\s*<\/span>/,
        '<EditableElement targetId={`home.testimonials.items.${idx}.role`} label={`Testimonial ${idx + 1} Company`} defaultValue={t.company}><span className="text-[10px] font-mono text-gray-400 mt-0.5">{t.company}</span></EditableElement>'
      );
      return c;
    },
  },

  // 39. TravelLayout TestimonialsSection
  {
    name: 'TravelLayout/TestimonialsSection',
    filePath: 'components/site/layouts/TravelLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(/targetId=\{index === 0 \? "travel\.home\.testimonials\.quote" : `travel\.home\.testimonials\.testimonial\$\{index\}\.quote`\}/g, 'targetId={`home.testimonials.items.${index}.quote`}');
      c = c.replace(/targetId=\{index === 0 \? "travel\.home\.testimonials\.author" : `travel\.home\.testimonials\.testimonial\$\{index\}\.author`\}/g, 'targetId={`home.testimonials.items.${index}.author`}');
      c = c.replace(/targetId=\{index === 0 \? "travel\.home\.testimonials\.role" : `travel\.home\.testimonials\.testimonial\$\{index\}\.role`\}/g, 'targetId={`home.testimonials.items.${index}.role`}');
      return c;
    },
  },

  // 40. BlogLayout TestimonialsSection
  {
    name: 'BlogLayout/TestimonialsSection',
    filePath: 'components/site/layouts/BlogLayout/body/components/TestimonialsSection/index.tsx',
    transform: (code) => {
      let c = ensureEditableElementImport(code);
      // Title
      c = c.replace(
        /<motion\.h2[^>]*>([\s\S]*?)<\/motion\.h2>/,
        '<EditableElement targetId="home.testimonials.title" label="Section Title" defaultValue="Stories from our community"><motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">$1</motion.h2></EditableElement>'
      );
      // Text
      c = c.replace(
        /<p className="text-md font-medium text-gray-900 mb-6">“\{t\.text\}”<\/p>/g,
        '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.text}><p className="text-md font-medium text-gray-900 mb-6">“{t.text}”</p></EditableElement>'
      );
      // Author
      c = c.replace(
        /<p className="text-sm font-semibold text-gray-900">\{t\.name\}<\/p>/g,
        '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.name}><p className="text-sm font-semibold text-gray-900">{t.name}</p></EditableElement>'
      );
      return c;
    },
  },

  // 41. Automotive2Layout TestimonialsCarouselSection
  {
    name: 'Automotive2Layout/TestimonialsCarouselSection',
    filePath: 'components/site/layouts/Automotive2Layout/body/components/TestimonialsCarouselSection/index.tsx',
    transform: (code) => {
      let c = code;
      // Upgrade active slide target
      c = c.replace(
        /targetId="automotive2\.home\.testimonials\.quote"/g,
        'targetId={`home.testimonials.items.${current}.quote`}'
      );
      c = c.replace(
        /targetId="automotive2\.home\.testimonials\.author"/g,
        'targetId={`home.testimonials.items.${current}.author`}'
      );
      c = c.replace(
        /targetId="automotive2\.home\.testimonials\.role"/g,
        'targetId={`home.testimonials.items.${current}.role`}'
      );
      return c;
    },
  },

  // 42. ConsultancyLayout TestimonialsCarouselSection
  {
    name: 'ConsultancyLayout/TestimonialsCarouselSection',
    filePath: 'components/site/layouts/ConsultancyLayout/body/components/TestimonialsCarouselSection/index.tsx',
    transform: (code) => {
      let c = code;
      c = c.replace(
        /targetId="consultancy\.home\.testimonials\.quote"/g,
        'targetId={`home.testimonials.items.${current}.quote`}'
      );
      c = c.replace(
        /targetId="consultancy\.home\.testimonials\.author"/g,
        'targetId={`home.testimonials.items.${current}.author`}'
      );
      c = c.replace(
        /targetId="consultancy\.home\.testimonials\.role"/g,
        'targetId={`home.testimonials.items.${current}.role`}'
      );
      return c;
    },
  },
];

console.log(`Starting upgrade for ${tasks.length} Testimonials components...`);

let successCount = 0;
for (const task of tasks) {
  const fullPath = path.resolve(task.filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${task.filePath}`);
    continue;
  }
  const original = fs.readFileSync(fullPath, 'utf8');
  try {
    const updated = task.transform(original);
    if (updated !== original) {
      fs.writeFileSync(fullPath, updated, 'utf8');
      console.log(`[UPDATED] ${task.name}`);
      successCount++;
    } else {
      console.log(`[NO CHANGE] ${task.name} (already matched or regex didn't catch)`);
    }
  } catch (err: any) {
    console.error(`[ERROR] ${task.name}:`, err.message);
  }
}

console.log(`\nFinished: ${successCount} files updated.`);
