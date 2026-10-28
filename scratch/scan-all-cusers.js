const fs = require('fs');
const path = require('path');

const userDataDir = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data');
const entries = fs.readdirSync(userDataDir);

for (const entry of entries) {
  const cookiePath = path.join(userDataDir, entry, 'Network', 'Cookies');
  if (fs.existsSync(cookiePath)) {
    try {
      const tmp = path.resolve('scratch', `temp_c_${entry.replace(/\s+/g, '_')}.tmp`);
      fs.copyFileSync(cookiePath, tmp);
      const buf = fs.readFileSync(tmp);
      const str = buf.toString('latin1');
      fs.unlinkSync(tmp);
      const hasCUser = str.includes('c_user');
      const hasMeta = str.includes('developers.facebook.com');
      if (hasCUser || hasMeta) {
        console.log(`[${entry}]: hasCUser=${hasCUser}, hasMeta=${hasMeta}`);
      }
    } catch (err) {
      console.log(`[${entry}]: ${err.message}`);
    }
  }
}
