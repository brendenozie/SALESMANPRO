const fs = require('fs');
const p = 'C:/Users/Brenden/AndroidStudioProjects/Salesmanpro/app/src/main/java/site/salesmanpro/android/MainActivity.kt';
let code = fs.readFileSync(p, 'utf8');

// Ensure import of BluetoothDeviceItem
if (!code.includes('import site.salesmanpro.android.data.models.BluetoothDeviceItem')) {
  code = code.replace(
    'import site.salesmanpro.android.ui.screens.BluetoothScannerScreen',
    'import site.salesmanpro.android.ui.screens.BluetoothScannerScreen\nimport site.salesmanpro.android.data.models.BluetoothDeviceItem'
  );
}

// Explicit type for device in onDeviceSelected
code = code.replace(
  'onDeviceSelected = { device ->',
  'onDeviceSelected = { device: BluetoothDeviceItem ->'
);

fs.writeFileSync(p, code, 'utf8');
console.log('Fixed BluetoothDeviceItem import and explicit type in MainActivity.kt');
