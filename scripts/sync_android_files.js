const fs = require('fs');

const androidBase = 'C:/Users/Brenden/AndroidStudioProjects/Salesmanpro/app/src/main/java/site/salesmanpro/android';

const files = [
  { src: `${androidBase}/MainActivity.kt`, dest: 'scripts/MainActivity.kt' },
  { src: `${androidBase}/data/api/ApiService.kt`, dest: 'scripts/ApiService.kt' },
  { src: `${androidBase}/data/models/AppSession.kt`, dest: 'scripts/AppSession.kt' },
  { src: `${androidBase}/ui/screens/LoginScreen.kt`, dest: 'scripts/LoginScreen.kt' },
];

for (const f of files) {
  if (fs.existsSync(f.src)) {
    fs.copyFileSync(f.src, f.dest);
    console.log(`Synced ${f.src} -> ${f.dest}`);
  }
}
