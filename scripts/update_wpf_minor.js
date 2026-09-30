const fs = require('fs');

fs.copyFileSync('scripts/AppSettings.cs', 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Models/AppSettings.cs');
fs.copyFileSync('scripts/PrinterDiscoveryService.cs', 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrinterDiscoveryService.cs');
console.log('Updated AppSettings.cs and PrinterDiscoveryService.cs');
