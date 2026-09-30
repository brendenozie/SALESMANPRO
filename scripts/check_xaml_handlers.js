const fs = require('fs');
const xaml = fs.readFileSync('C:/Users/Brenden/source/repos/SalesmanProDesktop/Views/MainWindow.xaml', 'utf8');

// Find all Click="..." and SelectionChanged="..." and MouseDown="..."
const clickMatches = [...xaml.matchAll(/Click="([^"]+)"/g)].map(m => m[1]);
const selMatches = [...xaml.matchAll(/SelectionChanged="([^"]+)"/g)].map(m => m[1]);
const mouseMatches = [...xaml.matchAll(/MouseDown="([^"]+)"/g)].map(m => m[1]);
const names = [...xaml.matchAll(/x:Name="([^"]+)"/g)].map(m => m[1]);

console.log('Clicks:', [...new Set(clickMatches)]);
console.log('Selections:', [...new Set(selMatches)]);
console.log('MouseDowns:', [...new Set(mouseMatches)]);
console.log('Names:', [...new Set(names)]);
