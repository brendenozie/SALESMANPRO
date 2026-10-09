const https = require('https');

// Candidates for replacement images
const candidates = [
  {
    name: 'Coffee Table',
    url: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Office Chair',
    url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Bookshelf',
    url: 'https://images.unsplash.com/photo-1594671581654-278545c41521?auto=format&fit=crop&w=800&q=80' // check alternative
  },
  {
    name: 'Bookshelf Alt',
    url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Jeans',
    url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Engine Oil / Motor',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cod Liver Oil / Supplements',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Rugby Tournament Pass',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Solar PV Audit',
    url: 'https://images.unsplash.com/photo-1508873696983-2df570464756?auto=format&fit=crop&w=800&q=80'
  }
];

function checkUrl(candidate) {
  return new Promise((resolve) => {
    https.request(candidate.url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ name: candidate.name, url: candidate.url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ name: candidate.name, url: candidate.url, status: err.message });
    }).end();
  });
}

(async () => {
  for (const c of candidates) {
    const res = await checkUrl(c);
    console.log(`${res.status} | ${res.name} | ${res.url}`);
  }
})();
