const fs = require('fs');

const content = fs.readFileSync('scripts/MainWindowExact.cs', 'utf8');
const lines = content.replace(/\r/g, '').split('\n');

const startIdx = lines.findIndex(l => l.includes('private void LoadStorePosInWebView()'));
if (startIdx === -1) throw new Error('Could not find LoadStorePosInWebView');

// The method runs until line with single closing brace at indentation 8
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i] === '        }') {
    endIdx = i;
    break;
  }
}

console.log(`Replacing lines ${startIdx} to ${endIdx}`);

const replacement = [
  '        private void LoadStorePosInWebView()',
  '        {',
  '            var session = _authService.CurrentSession;',
  '            if (session == null || string.IsNullOrEmpty(session.Token)) return;',
  '',
  '            var companySlug = session.Company?.Slug ?? "admin";',
  '            string path;',
  '            var role = session.User?.Role?.ToUpperInvariant() ?? "STAFF";',
  '',
  '            if (role == "SUPER_ADMIN")',
  '            {',
  '                path = $"/super-admin?token={session.Token}&platform=WPF";',
  '            }',
  '            else if (role == "AGENT")',
  '            {',
  '                path = $"/agents?token={session.Token}&platform=WPF";',
  '            }',
  '            else if (role == "STAFF" || role == "CASHIER")',
  '            {',
  '                path = $"/admin/{companySlug}/storepos?token={session.Token}&storeId={session.ActiveStoreId}&deviceId={session.Device.DeviceId}&platform=WPF";',
  '            }',
  '            else',
  '            {',
  '                path = $"/admin/{companySlug}?token={session.Token}&platform=WPF";',
  '            }',
  '',
  '            var url = $"{_authService.BaseUrl}{path}";',
  '',
  '            if (webView.CoreWebView2 != null)',
  '            {',
  '                webView.CoreWebView2.Navigate(url);',
  '            }',
  '        }'
];

lines.splice(startIdx, endIdx - startIdx + 1, ...replacement);
const finalContent = lines.join('\r\n');
fs.writeFileSync('scripts/MainWindow.xaml.cs', finalContent, 'utf8');
fs.writeFileSync('C:/Users/Brenden/source/repos/SalesmanProDesktop/Views/MainWindow.xaml.cs', finalContent, 'utf8');

console.log('MainWindow.xaml.cs updated successfully!');
