const fs = require('fs');
const path = require('path');

const androidBase = 'C:/Users/Brenden/AndroidStudioProjects/Salesmanpro/app/src/main/java/site/salesmanpro/android';

const files = [
  { src: 'scripts/MainActivity.kt', dest: `${androidBase}/MainActivity.kt` },
  { src: 'scripts/ApiService.kt', dest: `${androidBase}/data/api/ApiService.kt` },
  { src: 'scripts/AppSession.kt', dest: `${androidBase}/data/models/AppSession.kt` },
  { src: 'scripts/SessionManager.kt', dest: `${androidBase}/data/preferences/SessionManager.kt` },
  { src: 'scripts/OfflineDatabaseHelper.kt', dest: `${androidBase}/data/local/OfflineDatabaseHelper.kt` },
  { src: 'scripts/LoginScreen.kt', dest: `${androidBase}/ui/screens/LoginScreen.kt` },
  { src: 'scripts/MainWebViewScreen.kt', dest: `${androidBase}/ui/screens/MainWebViewScreen.kt` },
  { src: 'scripts/WebAppInterface.kt', dest: `${androidBase}/webbridge/WebAppInterface.kt` },
  { src: 'scripts/UnifiedPrinterManager.kt', dest: `${androidBase}/hardware/UnifiedPrinterManager.kt` },
  { src: 'scripts/BluetoothPrinterService.kt', dest: `${androidBase}/hardware/bluetooth/BluetoothPrinterService.kt` },
  { src: 'scripts/NormalizedPrintPayload.kt', dest: `${androidBase}/data/models/NormalizedPrintPayload.kt` },
];

for (const f of files) {
  if (fs.existsSync(f.src)) {
    const destDir = path.dirname(f.dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(f.src, f.dest);
    console.log(`Copied ${f.src} -> ${f.dest}`);
  } else {
    console.error(`Missing source: ${f.src}`);
  }
}
