const fs = require('fs');

const mappings = [
  { src: 'scripts/AppSession.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Models/AppSession.cs' },
  { src: 'scripts/NormalizedPrintPayload.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Models/NormalizedPrintPayload.cs' },
  { src: 'scripts/PrinterConnection.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Models/PrinterConnection.cs' },
  { src: 'scripts/SecurityService.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/SecurityService.cs' },
  { src: 'scripts/AuthService.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/AuthService.cs' },
  { src: 'scripts/PrinterProfileService.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrinterProfileService.cs' },
  { src: 'scripts/PrintQueueService.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrintQueueService.cs' },
  { src: 'scripts/PrinterService.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrinterService.cs' },
  { src: 'scripts/PrintManager.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrintManager.cs' },
  { src: 'scripts/PrinterDiscoveryService.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrinterDiscoveryService.cs' },
  { src: 'scripts/MainWindow.xaml.cs', dest: 'C:/Users/Brenden/source/repos/SalesmanProDesktop/Views/MainWindow.xaml.cs' }
];

for (const m of mappings) {
  const content = fs.readFileSync(m.src, 'utf8');
  fs.writeFileSync(m.dest, content, 'utf8');
  console.log(`Copied ${m.src} -> ${m.dest}`);
}
