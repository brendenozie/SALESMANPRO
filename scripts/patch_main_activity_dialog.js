const fs = require('fs');
const p = 'C:/Users/Brenden/AndroidStudioProjects/Salesmanpro/app/src/main/java/site/salesmanpro/android/MainActivity.kt';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  'import site.salesmanpro.android.ui.screens.BluetoothScannerScreen',
  'import site.salesmanpro.android.ui.components.BluetoothScannerDialog'
);

code = code.replace(
  'BluetoothScannerScreen(',
  'BluetoothScannerDialog('
);

fs.writeFileSync(p, code, 'utf8');
console.log('Switched MainActivity.kt to BluetoothScannerDialog');
