const fs = require('fs');

console.log('=== 1. ASSIGNMENTS ===');
const assignPage = fs.readFileSync('./app/admin/[slug]/assignments/page.tsx', 'utf8');
console.log(assignPage.slice(0, 1000));

console.log('=== 2. EXAM CATEGORIES ===');
const examCatPage = fs.readFileSync('./app/admin/[slug]/exam-categories/page.tsx', 'utf8');
console.log(examCatPage);

console.log('=== 3. ACTIVITIES ===');
const actPage = fs.readFileSync('./app/admin/[slug]/activities/page.tsx', 'utf8');
console.log(actPage.slice(0, 1000));

console.log('=== 4. SCHOOL EVENTS ===');
const eventPage = fs.readFileSync('./app/admin/[slug]/school-events/page.tsx', 'utf8');
console.log(eventPage.slice(0, 1200));

console.log('=== 5. ANNOUNCEMENTS ===');
const annPage = fs.readFileSync('./app/admin/[slug]/schoolAnnouncements/page.tsx', 'utf8');
console.log(annPage.slice(0, 1200));
