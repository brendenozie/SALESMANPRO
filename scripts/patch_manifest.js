const fs = require('fs');
const p = 'C:/Users/Brenden/AndroidStudioProjects/Salesmanpro/app/src/main/AndroidManifest.xml';
let c = fs.readFileSync(p, 'utf8');
const target = '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />';
const addition = `<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.usb.host" android:required="false" />`;

if (c.includes(target) && !c.includes('android.permission.CAMERA')) {
  c = c.replace(target, addition);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Successfully updated AndroidManifest.xml with camera and USB permissions.');
} else {
  console.log('Already updated or target not found.');
}

