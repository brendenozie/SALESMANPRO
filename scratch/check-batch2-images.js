const https = require('https');

const candidateImages = [
  // Honey
  "https://dozi4r4ug9739.cloudfront.net/images/1761641677232-pexels-marta-dzedyshko-1042863-2067569.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1761641677233-pexels-alinevianafoto-2465877.jpg",
  // Baby
  "https://dozi4r4ug9739.cloudfront.net/images/1772222037583-pexels-babydov-7789062.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1779983928821-pexels-ketut-subiyanto-4720807.jpg",
  // Watches
  "https://dozi4r4ug9739.cloudfront.net/images/1772312388704-stefen-tan-KYw1eUx1J7Y-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1772312388804-kitai-zhvaeh-R9rA-unsplash.jpg",
  // Pets
  "https://dozi4r4ug9739.cloudfront.net/images/1772312388807-kari-shea-1SAnrIxw5OY-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1780466319431-pexels-yvon-gallant-81432586-8941515.jpg",
  // Earphones
  "https://dozi4r4ug9739.cloudfront.net/images/1782163103393-pexels-sejio402-29336327.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1772222037581-still-life-wireless-cyberpunk-headphones_23-2151072202.jpg",
  // Hardware / Tools
  "https://dozi4r4ug9739.cloudfront.net/images/1772312389195-sam-pak-X6QffKLwyoQ-unsplash.jpg",
  "https://dozi4r4ug9739.cloudfront.net/images/1782163210269-pexels-tima-miroshnichenko-6263105.jpg"
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, status: 'ERROR', error: e.message });
    });
  });
}

async function run() {
  console.log("Checking candidate CDN image URLs for Batch 2...");
  for (const url of candidateImages) {
    const r = await checkUrl(url);
    console.log(`${r.status} : ${url}`);
  }
}

run();
