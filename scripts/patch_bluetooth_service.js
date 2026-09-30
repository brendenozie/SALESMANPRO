const fs = require('fs');
const p = 'C:/Users/Brenden/AndroidStudioProjects/Salesmanpro/app/src/main/java/site/salesmanpro/android/hardware/bluetooth/BluetoothPrinterService.kt';
let code = fs.readFileSync(p, 'utf8');

// Replace .toByteArray() with .toByteArray(Charsets.US_ASCII) across the file
code = code.replace(/\.toByteArray\(\)/g, '.toByteArray(Charsets.US_ASCII)');

fs.writeFileSync(p, code, 'utf8');
console.log('Fixed toByteArray with explicit Charsets.US_ASCII in BluetoothPrinterService.kt');
