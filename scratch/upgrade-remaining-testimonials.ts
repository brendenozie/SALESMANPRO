import fs from 'fs';
import path from 'path';

function ensureEditableImport(code: string): string {
  if (code.includes('EditableElement')) return code;
  if (code.startsWith("'use client'") || code.startsWith('"use client"')) {
    const lines = code.split('\n');
    lines.splice(1, 0, "import { EditableElement } from '@/contexts/EditableContentContext';");
    return lines.join('\n');
  }
  return "import { EditableElement } from '@/contexts/EditableContentContext';\n" + code;
}

// 1. ConsultancyLayout TestimonialsCarouselSection
{
  const p = 'components/site/layouts/ConsultancyLayout/body/components/TestimonialsCarouselSection/index.tsx';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/targetId=\{current === 0 \? "consultancy\.home\.testimonials\.quote" : `consultancy\.home\.testimonials\.slide\$\{current\}\.quote`\}/g, 'targetId={`home.testimonials.items.${current}.quote`}');
  c = c.replace(/targetId=\{current === 0 \? "consultancy\.home\.testimonials\.author" : `consultancy\.home\.testimonials\.slide\$\{current\}\.author`\}/g, 'targetId={`home.testimonials.items.${current}.author`}');
  c = c.replace(/targetId=\{current === 0 \? "consultancy\.home\.testimonials\.role" : `consultancy\.home\.testimonials\.slide\$\{current\}\.role`\}/g, 'targetId={`home.testimonials.items.${current}.role`}');
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated ConsultancyLayout/TestimonialsCarouselSection');
}

// 2. EcommerceAgrovetLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceAgrovetLayout/body/components/TestimonialsSection/index.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-xl font-medium text-slate-700 leading-relaxed mb-10 italic">\s*"\{t\.text\}"\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.text}><p className="text-xl font-medium text-slate-700 leading-relaxed mb-10 italic">"{t.text}"</p></EditableElement>'
  );
  c = c.replace(
    /<p className="font-black text-slate-900 uppercase tracking-tighter">\{t\.name\}<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.name}><p className="font-black text-slate-900 uppercase tracking-tighter">{t.name}</p></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceAgrovetLayout');
}

// 3. EcommerceBookLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceBookLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-2xl font-serif italic text-zinc-900 dark:text-white leading-tight">\s*“\{t\.quote\}”\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-2xl font-serif italic text-zinc-900 dark:text-white leading-tight">“{t.quote}”</p></EditableElement>'
  );
  c = c.replace(
    /<h4 className="text-\[10px\] font-mono uppercase tracking-\[0\.2em\] text-zinc-900 dark:text-white">\s*\{t\.authorName\}\s*<\/h4>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-900 dark:text-white">{t.authorName}</h4></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceBookLayout');
}

// 4. EcommerceCakeLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceCakeLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<blockquote className="text-lg text-slate-700 font-medium italic leading-relaxed mb-8">\s*“\{t\.quote\}”\s*<\/blockquote>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><blockquote className="text-lg text-slate-700 font-medium italic leading-relaxed mb-8">“{t.quote}”</blockquote></EditableElement>'
  );
  c = c.replace(
    /<h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">\s*\{t\.authorName\}\s*<\/h4>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">{t.authorName}</h4></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceCakeLayout');
}

// 5. EcommerceEarphonesLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceEarphonesLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-xl md:text-2xl font-medium text-black\/80 dark:text-white\/80 leading-relaxed italic tracking-tight">\s*&ldquo;\{t\.quote\}&rdquo;\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-xl md:text-2xl font-medium text-black/80 dark:text-white/80 leading-relaxed italic tracking-tight">&ldquo;{t.quote}&rdquo;</p></EditableElement>'
  );
  c = c.replace(
    /<h3 className="text-black dark:text-white font-black italic uppercase tracking-widest text-sm">\s*\{t\.authorName\}\s*<\/h3>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h3 className="text-black dark:text-white font-black italic uppercase tracking-widest text-sm">{t.authorName}</h3></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceEarphonesLayout');
}

// 6. EcommerceFlowersLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceFlowersLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-slate-600 font-serif italic text-lg leading-relaxed px-4">\s*\{t\.quote\}\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-slate-600 font-serif italic text-lg leading-relaxed px-4">{t.quote}</p></EditableElement>'
  );
  c = c.replace(
    /<h3 className="text-\[11px\] font-black uppercase tracking-\[0\.3em\] text-slate-900">\s*\{t\.authorName\}\s*<\/h3>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t.authorName}</h3></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceFlowersLayout');
}

// 7. EcommerceGamingLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceGamingLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="relative z-10 text-zinc-600 dark:text-zinc-400 text-lg font-medium leading-relaxed italic group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">\s*\{t\.quote\}\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="relative z-10 text-zinc-600 dark:text-zinc-400 text-lg font-medium leading-relaxed italic group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">{t.quote}</p></EditableElement>'
  );
  c = c.replace(
    /<h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest group-hover:text-red-600 transition-colors">\s*\{t\.authorName\}\s*<\/h3>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest group-hover:text-red-600 transition-colors">{t.authorName}</h3></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceGamingLayout');
}

// 8. EcommerceGroceriesLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceGroceriesLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-xl font-medium text-gray-700 leading-relaxed italic">\s*&ldquo;\{testimonial\.quote\}&rdquo;\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={testimonial.quote}><p className="text-xl font-medium text-gray-700 leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p></EditableElement>'
  );
  c = c.replace(
    /<h4 className="text-lg font-black text-gray-900">\{testimonial\.authorName\}<\/h4>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={testimonial.authorName}><h4 className="text-lg font-black text-gray-900">{testimonial.authorName}</h4></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceGroceriesLayout');
}

// 9. EcommerceHardwareLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceHardwareLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<blockquote className="text-2xl text-zinc-900 dark:text-white font-black italic uppercase tracking-tighter mb-12 leading-none group-hover:text-amber-500 transition-colors">\s*"\{t\.quote\}"\s*<\/blockquote>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><blockquote className="text-2xl text-zinc-900 dark:text-white font-black italic uppercase tracking-tighter mb-12 leading-none group-hover:text-amber-500 transition-colors">"{t.quote}"</blockquote></EditableElement>'
  );
  c = c.replace(
    /<h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none mb-1">\s*\{t\.authorName\}\s*<\/h4>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none mb-1">{t.authorName}</h4></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceHardwareLayout');
}

// 10. EcommerceHoneyLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceHoneyLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-\[#3E2723\]\/80 font-medium italic leading-relaxed mb-8 text-lg">\s*\{testimonial\.quote\}\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={testimonial.quote}><p className="text-[#3E2723]/80 font-medium italic leading-relaxed mb-8 text-lg">{testimonial.quote}</p></EditableElement>'
  );
  c = c.replace(
    /<h4 className="text-sm font-black text-\[#3E2723\] uppercase tracking-widest">\s*\{testimonial\.authorName\}\s*<\/h4>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={testimonial.authorName}><h4 className="text-sm font-black text-[#3E2723] uppercase tracking-widest">{testimonial.authorName}</h4></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceHoneyLayout');
}

// 11. EcommerceMeatLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceMeatLayout/body/components/TestimonialsSection/index.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-xl font-bold text-stone-800 dark:text-stone-200 leading-snug mb-12 tracking-tight italic">\s*"\{t\.text\}"\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.text}><p className="text-xl font-bold text-stone-800 dark:text-stone-200 leading-snug mb-12 tracking-tight italic">"{t.text}"</p></EditableElement>'
  );
  c = c.replace(
    /<p className="font-black text-stone-950 dark:text-white uppercase tracking-tighter text-sm">\{t\.name\}<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.name}><p className="font-black text-stone-950 dark:text-white uppercase tracking-tighter text-sm">{t.name}</p></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceMeatLayout');
}

// 12. EcommerceMotorCycleLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceMotorCycleLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-10">\s*"\{testimonial\.quote\}"\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={testimonial.quote}><p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-10">"{testimonial.quote}"</p></EditableElement>'
  );
  c = c.replace(
    /<h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">\s*\{testimonial\.authorName\}\s*<\/h3>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={testimonial.authorName}><h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{testimonial.authorName}</h3></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceMotorCycleLayout');
}

// 13. EcommercePeanutsLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommercePeanutsLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-\[#3E2723\] font-medium leading-relaxed mb-8 italic">\s*\{t\.quote\}\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-[#3E2723] font-medium leading-relaxed mb-8 italic">{t.quote}</p></EditableElement>'
  );
  c = c.replace(
    /<h4 className="font-black text-\[#3E2723\] text-sm uppercase tracking-wider">\{t\.authorName\}<\/h4>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="font-black text-[#3E2723] text-sm uppercase tracking-wider">{t.authorName}</h4></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommercePeanutsLayout');
}

// 14. EcommercePetsLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommercePetsLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-lg font-medium text-slate-700 dark:text-zinc-300 leading-relaxed mb-8 italic">\s*"\{t\.quote\}"\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.quote}><p className="text-lg font-medium text-slate-700 dark:text-zinc-300 leading-relaxed mb-8 italic">"{t.quote}"</p></EditableElement>'
  );
  c = c.replace(
    /<h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">\s*\{t\.authorName\}\s*<\/h4>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.authorName}</h4></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommercePetsLayout');
}

// 15. EcommerceWatchLayout TestimonialsSection
{
  const p = 'components/site/layouts/EcommerceWatchLayout/body/components/TestimonialsSection/TestimonialsSection.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-10">\s*"\{testimonial\.quote\}"\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={testimonial.quote}><p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed mb-10">"{testimonial.quote}"</p></EditableElement>'
  );
  c = c.replace(
    /<h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">\s*\{testimonial\.authorName\}\s*<\/h3>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={testimonial.authorName}><h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{testimonial.authorName}</h3></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated EcommerceWatchLayout');
}

// 16. Security2Layout TestimonialsSection
{
  const p = 'components/site/layouts/Security2Layout/body/components/TestimonialsSection/index.tsx';
  let c = ensureEditableImport(fs.readFileSync(p, 'utf8'));
  c = c.replace(
    /<p className="text-xs font-mono text-gray-600 leading-relaxed uppercase">\s*\{t\.text\}\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.quote`} label={`Testimonial ${index + 1} Quote`} type="textarea" defaultValue={t.text}><p className="text-xs font-mono text-gray-600 leading-relaxed uppercase">{t.text}</p></EditableElement>'
  );
  c = c.replace(
    /<p className="text-sm font-black tracking-tight uppercase text-gray-900">\s*\{t\.authorName\}\s*<\/p>/,
    '<EditableElement targetId={`home.testimonials.items.${index}.author`} label={`Testimonial ${index + 1} Author`} defaultValue={t.authorName}><p className="text-sm font-black tracking-tight uppercase text-gray-900">{t.authorName}</p></EditableElement>'
  );
  fs.writeFileSync(p, c, 'utf8');
  console.log('Updated Security2Layout');
}
