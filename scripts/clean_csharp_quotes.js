const fs = require('fs');
const files = [
  'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrinterService.cs',
  'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrintManager.cs',
  'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrinterDiscoveryService.cs',
  'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrinterProfileService.cs',
  'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/PrintQueueService.cs',
  'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/AuthService.cs',
  'C:/Users/Brenden/source/repos/SalesmanProDesktop/Services/SecurityService.cs',
  'C:/Users/Brenden/source/repos/SalesmanProDesktop/Views/MainWindow.xaml.cs'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    // If double double-quotes exist (e.g. ""Hello""), replace with standard single double-quote "
    // But be careful if there are valid verbatim string quotes or empty string quotes
    // In our generated files, standard strings were generated as $""..."" or ""text""
    let fixed = content;
    // Replace $"" with $"
    fixed = fixed.replace(/\$""/g, '$"');
    // Replace "" with "
    fixed = fixed.replace(/""/g, '"');
    fs.writeFileSync(f, fixed, 'utf8');
    console.log(`Cleaned quotes in ${f}`);
  }
}
