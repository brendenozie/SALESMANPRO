const fs = require('fs');
const p = 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/SettingServices.cs';
let code = fs.readFileSync(p, 'utf8');
if (!code.includes('using SalesmanProDesktop.Models;')) {
  code = 'using SalesmanProDesktop.Models;\n' + code;
  fs.writeFileSync(p, code, 'utf8');
  console.log('Added using directive to SettingServices.cs');
}
