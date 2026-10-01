const fs = require('fs');

let code = fs.readFileSync('scripts/MainWindowExact.cs', 'utf8');

const newMethod = `        private void LoadStorePosInWebView()
        {
            var session = _authService.CurrentSession;
            if (session == null || string.IsNullOrEmpty(session.Token)) return;

            var companySlug = session.Company?.Slug ?? "admin";
            string path;
            var role = session.User?.Role?.ToUpperInvariant() ?? "STAFF";

            if (role == "SUPER_ADMIN")
            {
                path = $"/super-admin?token={session.Token}&platform=WPF";
            }
            else if (role == "AGENT")
            {
                path = $"/agents?token={session.Token}&platform=WPF";
            }
            else if (role == "STAFF" || role == "CASHIER")
            {
                path = $"/admin/{companySlug}/storepos?token={session.Token}&storeId={session.ActiveStoreId}&deviceId={session.Device.DeviceId}&platform=WPF";
            }
            else
            {
                path = $"/admin/{companySlug}?token={session.Token}&platform=WPF";
            }

            var url = $"{_authService.BaseUrl}{path}";

            if (webView.CoreWebView2 != null)
            {
                webView.CoreWebView2.Navigate(url);
            }
        }`;

code = code.replace(
    /private void LoadStorePosInWebView\(\)[\s\S]*?if \(webView\.CoreWebView2 != null\)[\s\S]*?webView\.CoreWebView2\.Navigate\(url\);[\s\S]*?\}/,
    newMethod.trim()
);

fs.writeFileSync('scripts/MainWindow.xaml.cs', code, 'utf8');
console.log('Successfully updated scripts/MainWindow.xaml.cs with exact XAML handlers and role routing!');
