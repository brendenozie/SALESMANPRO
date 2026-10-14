const fs = require('fs');

const f1 = 'components/site/layouts/CoursesLayout2/body/components/HeroSection/index.tsx';
const c1 = fs.readFileSync(f1, 'utf8');
const m1 = c1.match(/targetId=[^>\s]+/g);
console.log('CoursesLayout2 HeroSection:', m1);

const f2 = 'components/site/layouts/DeliveryLayout/body/components/AbSection/index.tsx';
const c2 = fs.readFileSync(f2, 'utf8');
const m2 = c2.match(/targetId=[^>\s]+/g);
console.log('DeliveryLayout AbSection:', m2);

const f3 = 'components/site/layouts/EcommerceWatchLayout/body/components/PromoSection/index.tsx';
const c3 = fs.readFileSync(f3, 'utf8');
const m3 = c3.match(/targetId=[^>\s]+/g);
console.log('EcommerceWatchLayout PromoSection:', m3);
