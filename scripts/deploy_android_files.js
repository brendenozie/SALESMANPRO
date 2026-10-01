const fs = require('fs');

const androidBase = 'C:/Users/Brenden/AndroidStudioProjects/Salesmanpro/app/src/main/java/site/salesmanpro/android';

const files = [
  { src: 'scripts/MainActivity.kt', dest: `${androidBase}/MainActivity.kt` },
  { src: 'scripts/ApiService.kt', dest: `${androidBase}/data/api/ApiService.kt` },
  { src: 'scripts/AppSession.kt', dest: `${androidBase}/data/models/AppSession.kt` },
  { src: 'scripts/LoginScreen.kt', dest: `${androidBase}/ui/screens/LoginScreen.kt` },
];

for (const f of files) {
  if (fs.existsSync(f.src)) {
    fs.copyFileSync(f.src, f.dest);
    console.log(`Copied ${f.src} -> ${f.dest}`);
  } else {
    console.error(`Missing source: ${f.src}`);
  }
}
