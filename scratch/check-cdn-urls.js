const https = require('https');

const urls = [
  // Glasses
  "https://dozi4r4ug9739.cloudfront.net/images/1772312106481-zeelool-glasses-aShmUdodJ3w-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1772312106526-omid-armin-Zt99Ho5Hq3s-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1772312106527-angus-gray-bSjqyqukCjY-unsplash.jpg",
  // Healthcare / Pharma
  "https://dozi4r4ug9739.cloudfront.net/images/1772312005666-towfiqu-barbhuiya-q-RyWM8uYwY-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1772312005667-tetiana-bykovets-Ht7ZhGt2UXg-unsplash.jpg",
  // Gaming / Audio
  "https://dozi4r4ug9739.cloudfront.net/images/1772222037581-still-life-wireless-cyberpunk-headphones_23-2151072202.jpg",
  // Shoes
  "https://dozi4r4ug9739.cloudfront.net/images/1772223357547-maksim-larin-NOpsC3nWTzY-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1772223357549-usama-akram-kP6knT7tjn4-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1772223357550-irene-kredenets-dwKiHoqqxk8-unsplash.jpg",
  // Food / Peanuts / Seeds
  "https://dozi4r4ug9739.cloudfront.net/images/1772278646360-sam-moghadam-SRzVKw8l_tA-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1772278646361-ziphaus-Sm7ebvMgi-E-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1772278646363-victor-g-N04FIfHhv_k-unsplash.jpg"
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', (e) => {
      resolve({ url, status: 'ERROR', error: e.message });
    });
  });
}

async function run() {
  console.log("Checking CDN images...");
  for (const url of urls) {
    const r = await checkUrl(url);
    console.log(`${r.status} : ${url}`);
  }
}

run();
