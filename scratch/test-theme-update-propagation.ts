import { applyWebsiteConfigToStoreData } from '../lib/website-builder/applyWebsiteConfigToStoreData';

const baseStore: any = {
  id: 'store-1',
  name: 'Original Store',
  description: 'Original description',
  heroSlides: [{ id: 's1', headline: 'Old Headline', subline: 'Old Subline', ctaText: 'Old CTA' }],
  CoreValues: [{ id: 'v1', title: 'Old Value', description: 'Old Desc' }],
  testimonials: [{ id: 't1', name: 'Old User', quote: 'Old Quote' }],
  faqs: [{ id: 'f1', question: 'Old Q', answer: 'Old A' }],
};

const updatedConfig: any = {
  pages: [{
    isHomepage: true,
    slug: 'home',
    sections: [
      {
        id: 'sec-hero',
        type: 'hero',
        content: {
          headline: 'Autumn Sneaker Drop 2026',
          subline: 'Engineered for comfort and endurance',
          ctaText: 'Claim Your Pair'
        }
      },
      {
        id: 'sec-features',
        type: 'features',
        content: {
          items: [
            { id: 'feat-1', title: 'Carbon Neutral Soles', description: 'Zero carbon footprint manufacturing' }
          ]
        }
      },
      {
        id: 'sec-testimonials',
        type: 'testimonials',
        content: {
          items: [
            { id: 'test-1', name: 'Marcus Chen', quote: 'Lightest shoes I have ever owned', rating: 5 }
          ]
        }
      },
      {
        id: 'sec-faqs',
        type: 'faqs',
        content: {
          items: [
            { id: 'faq-1', question: 'What is the return window?', answer: '30 days no questions asked.' }
          ]
        }
      },
      {
        id: 'sec-about',
        type: 'about',
        content: {
          description: 'Pioneering athletic innovation since 2012',
          founderName: 'Elena Rostova'
        }
      }
    ]
  }],
  componentOverrides: {
    'Header.brandName': 'Apex Athletics'
  }
};

const merged = applyWebsiteConfigToStoreData(baseStore, updatedConfig, 'home');

const checks = [
  { name: 'Brand Name Override', pass: merged.name === 'Apex Athletics', val: merged.name },
  { name: 'Hero Headline Propagation', pass: merged.heroSlides?.[0]?.headline === 'Autumn Sneaker Drop 2026', val: merged.heroSlides?.[0]?.headline },
  { name: 'Hero CTA Propagation', pass: merged.heroSlides?.[0]?.ctaText === 'Claim Your Pair', val: merged.heroSlides?.[0]?.ctaText },
  { name: 'CoreValues Propagation', pass: merged.CoreValues?.[0]?.title === 'Carbon Neutral Soles', val: merged.CoreValues?.[0]?.title },
  { name: 'Testimonials Propagation', pass: merged.testimonials?.[0]?.name === 'Marcus Chen', val: merged.testimonials?.[0]?.name },
  { name: 'FAQs Propagation', pass: merged.faqs?.[0]?.question === 'What is the return window?', val: merged.faqs?.[0]?.question },
  { name: 'About Description Propagation', pass: merged.description === 'Pioneering athletic innovation since 2012', val: merged.description },
  { name: 'Founder Name Propagation', pass: (merged as any).founderName === 'Elena Rostova', val: (merged as any).founderName },
];

console.log('=== THEME UPDATE PROPAGATION TEST RESULTS ===');
let allPassed = true;
checks.forEach((c, idx) => {
  console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${idx + 1}. ${c.name} -> ${c.val}`);
  if (!c.pass) allPassed = false;
});

if (allPassed) {
  console.log('\n>>> ALL 8/8 THEME PROPAGATION ASSERTIONS PASSED! <<<');
  process.exit(0);
} else {
  console.error('\n>>> SOME ASSERTIONS FAILED! <<<');
  process.exit(1);
}
