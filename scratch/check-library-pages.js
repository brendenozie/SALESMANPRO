const fs = require('fs');

const pages = [
  'library-acquisitions',
  'library-books-categories',
  'library-inventory',
  'library-maintenance',
  'library-reservations',
  'library-returns',
  'library-suppliers',
  'library-suppliers-categories'
];

pages.forEach(p => {
  const pth = 'app/admin/[slug]/' + p + '/page.tsx';
  const c = fs.readFileSync(pth, 'utf8');
  console.log(p, 'uses serverFetch:', c.includes('serverFetch'), 'uses fetch:', c.includes('fetch('));
});
