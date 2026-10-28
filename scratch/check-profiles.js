const fs = require('fs');
const path = require('path');

const userDataDir = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data');
const entries = fs.readdirSync(userDataDir);

for (const entry of entries) {
  const cookiePath = path.join(userDataDir, entry, 'Network', 'Cookies');
  if (fs.existsSync(cookiePath)) {
    try {
      const stats = fs.statSync(cookiePath);
      const buf = fs.readFileSync(cookiePath);
      const str = buf.toString('latin1');
      const hasFb = str.includes('facebook.com');
      const hasCUser = str.includes('c_user'); // c_user is the authenticated Facebook user ID cookie
      const hasMeta = str.includes('developers.facebook.com');
      if (hasCUser || hasMeta) {
        console.log(`FOUND: Profile [${entry}]: hasCUser=${hasCUser}, hasMeta=${hasMeta}, size=${stats.size}`);
      } else {
        console.log(`Profile [${entry}]: hasFb=${hasFb}, hasCUser=${hasCUser}`);
      }
    } catch (err) {
      console.log(`Profile [${entry}]: ${err.message}`);
    }
  }
}
