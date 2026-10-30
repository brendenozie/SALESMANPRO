using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using Microsoft.Web.WebView2.Core;
using SalesmanProDesktop.Models;
using SalesmanProDesktop.Services;

namespace SalesmanProDesktop.Views
{
    public partial class MainWindow : Window
    {
        private readonly AuthService _authService;
        private readonly PrinterService _printerService;
        private readonly PrinterProfileService _profileService;
        private readonly PrintQueueService _queueService;
        private readonly PrintManager _printManager;
        private readonly PrinterDiscoveryService _discoveryService;

        private PrinterConnection? _selectedConfigPrinter;
        private bool _isStaffPinTab = false;

        public MainWindow()
        {
            InitializeComponent();

            _authService = new AuthService();
            _printerService = new PrinterService();
            _profileService = new PrinterProfileService();
            _queueService = new PrintQueueService();
            _printManager = new PrintManager(_printerService, _profileService, _queueService);
            _discoveryService = new PrinterDiscoveryService();

            _authService.SessionChanged += OnSessionChanged;

            Loaded += MainWindow_Loaded;
        }

        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            UpdatePrinterStatusBadge();
            await InitializeWebViewAsync();

            var restored = _authService.RestorePersistedSession();
            if (restored != null)
            {
                ApplySessionUi(restored);
                SplashStatusText.Text = "Validating session...";
                var valid = await _authService.ValidateCurrentSessionAsync();
                if (valid)
                {
                    LoadStorePosInWebView();
                }
                else
                {
                    ShowLoginOverlay();
                }
            }
            else
            {
                ShowLoginOverlay();
            }
        }

        private async Task InitializeWebViewAsync()
        {
            try
            {
                var userDataFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro", "WebView2");
                var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                webView.CoreWebView2.PermissionRequested += (sender, args) => { args.State = Microsoft.Web.WebView2.Core.CoreWebView2PermissionState.Allow; };

                webView.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;
            }
            catch (Exception ex)
            {
                SplashStatusText.Text = $"WebView2 Error: {ex.Message}";
            }
        }

        private void OnSessionChanged(AppSession? session)
        {
            Dispatcher.Invoke(() =>
            {
                if (session != null)
                {
                    ApplySessionUi(session);
                }
                else
                {
                    ShowLoginOverlay();
                }
            });
        }

        private void ApplySessionUi(AppSession session)
        {
            LoginOverlay.Visibility = Visibility.Collapsed;
            SplashSection.Visibility = Visibility.Collapsed;

            var store = session.ActiveStore;
            StoreContextText.Text = store != null ? $"{session.Company.Name} • {store.Name}" : session.Company.Name;
            StoreContextBadge.Visibility = Visibility.Visible;

            UserNameText.Text = $"{session.User.Name} ({session.User.Role})";
            UserContextPanel.Visibility = Visibility.Visible;

            if (StoreSelectorCombo != null)
            {
                StoreSelectorCombo.ItemsSource = session.Stores;
                StoreSelectorCombo.SelectedValuePath = "Id";
                StoreSelectorCombo.DisplayMemberPath = "Name";
                StoreSelectorCombo.SelectedValue = session.ActiveStoreId;
                if (StoreSelectorCombo.SelectedItem == null && session.Stores.Count > 0)
                {
                    StoreSelectorCombo.SelectedIndex = 0;
                }
            }

            UpdatePrinterStatusBadge();
        }

        private void ShowLoginOverlay()
        {
            SplashSection.Visibility = Visibility.Collapsed;
            LoginOverlay.Visibility = Visibility.Visible;
            LoginErrorBanner.Visibility = Visibility.Collapsed;
            StoreContextBadge.Visibility = Visibility.Collapsed;
            UserContextPanel.Visibility = Visibility.Collapsed;
        }

        private void UpdatePrinterStatusBadge()
        {
            var p = _profileService.ResolvePrinter("RECEIPT", _authService.CurrentSession?.ActiveStoreId, _authService.CurrentSession?.Device.DeviceId);
            if (p != null && p.IsConfigured)
            {
                PrinterStatusText.Text = p.Name;
                PrinterDot.Fill = new SolidColorBrush(Color.FromRgb(16, 185, 129));
            }
            else
            {
                PrinterStatusText.Text = "No Printer";
                PrinterDot.Fill = new SolidColorBrush(Color.FromRgb(239, 68, 68));
            }
        }

        private void LoadStorePosInWebView()
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
        }

        private async void CoreWebView2_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                var json = e.WebMessageAsJson;
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                string? msgType = root.TryGetProperty("type", out var t) ? t.GetString() : null;

                if (msgType == "DISCOVER_PRINTERS" || msgType == "GET_PAIRED_DEVICES" || msgType == "ENUM_SPOOLER" || msgType == "DISCOVER_USB")
                {
                    var winPrinters = _discoveryService.GetInstalledWindowsPrinters();
                    var serialPrinters = _discoveryService.GetSerialPorts();
                    var all = new List<object>();

                    foreach (var p in winPrinters)
                    {
                        all.Add(new
                        {
                            id = p.Id,
                            name = p.Name,
                            address = p.Address,
                            connectionType = "WINDOWS_DRIVER",
                            paperWidth = p.PaperWidth,
                            isDefault = p.IsDefault
                        });
                    }

                    foreach (var p in serialPrinters)
                    {
                        all.Add(new
                        {
                            id = p.Id,
                            name = p.Name,
                            address = p.Address,
                            connectionType = "SERIAL",
                            paperWidth = p.PaperWidth,
                            isDefault = p.IsDefault
                        });
                    }

                    webView.CoreWebView2?.PostWebMessageAsJson(JsonSerializer.Serialize(new
                    {
                        type = "PRINTERS_DISCOVERED",
                        printers = all
                    }));
                    return;
                }

                if (msgType == "CONNECT_DEVICE")
                {
                    string? address = root.TryGetProperty("address", out var addrEl) ? addrEl.GetString() : null;
                    string? connType = root.TryGetProperty("connectionType", out var ctEl) ? ctEl.GetString() : "WINDOWS_DRIVER";
                    string? paperWidth = root.TryGetProperty("paperWidth", out var pwEl) ? pwEl.GetString() : "80mm";

                    if (!string.IsNullOrEmpty(address))
                    {
                        var profile = new PrinterConnection
                        {
                            Address = address,
                            Name = address,
                            PaperWidth = paperWidth ?? "80mm",
                            Purpose = "RECEIPT",
                            IsDefault = true,
                            Type = connType == "SERIAL" ? ConnectionType.Serial :
                                   connType == "NETWORK" ? ConnectionType.Network : ConnectionType.Windows
                        };
                        if (_authService.CurrentSession != null)
                        {
                            profile.StoreId = _authService.CurrentSession.ActiveStoreId;
                            profile.DeviceId = _authService.CurrentSession.Device.DeviceId;
                        }
                        _profileService.SaveProfile(profile);
                        Dispatcher.Invoke(() => UpdatePrinterStatusBadge());
                    }

                    webView.CoreWebView2?.PostWebMessageAsJson(JsonSerializer.Serialize(new
                    {
                        type = "DEVICE_CONNECTED",
                        success = !string.IsNullOrEmpty(address),
                        address = address
                    }));
                    return;
                }

                if (msgType == "SAVE_OFFLINE_OUTBOX" || msgType == "UPDATE_OFFLINE_OUTBOX")
                {
                    if (root.TryGetProperty("payload", out var outboxElem))
                    {
                        SaveOfflineOutboxEntryToDisk(outboxElem);
                    }
                    return;
                }

                if (msgType == "GET_OFFLINE_OUTBOX")
                {
                    var entries = LoadOfflineOutboxEntriesFromDisk();
                    webView.CoreWebView2?.PostWebMessageAsJson(JsonSerializer.Serialize(new
                    {
                        type = "OFFLINE_OUTBOX_LOADED",
                        records = entries
                    }));
                    return;
                }

                if (msgType == "TEST_PRINT")
                {
                    string? address = root.TryGetProperty("address", out var a) ? a.GetString() : null;
                    string? connType = root.TryGetProperty("connectionType", out var ct) ? ct.GetString() : "WINDOWS_DRIVER";
                    string? paperWidth = root.TryGetProperty("paperWidth", out var pw) ? pw.GetString() : "80mm";

                    if (!string.IsNullOrEmpty(address))
                    {
                        var testConn = new PrinterConnection
                        {
                            Address = address,
                            Name = address,
                            PaperWidth = paperWidth ?? "80mm",
                            Type = connType == "SERIAL" ? ConnectionType.Serial :
                                   connType == "NETWORK" ? ConnectionType.Network : ConnectionType.Windows
                        };

                        var storeName = _authService.CurrentSession?.ActiveStore?.Name ?? "Main Store";
                        var deviceName = _authService.CurrentSession?.Device.DeviceName ?? Environment.MachineName;

                        var (success, error) = await _printerService.PrintTestSlipAsync(testConn, storeName, deviceName);
                        webView.CoreWebView2?.PostWebMessageAsJson(JsonSerializer.Serialize(new
                        {
                            type = "TEST_PRINT_RESULT",
                            success = success,
                            error = error
                        }));
                    }
                    return;
                }

                // ---------------------------------------------------------------
                // CASH_DRAWER_KICK — sent by POS on every confirmed cash payment.
                // Sends the ESC/POS drawer-open pulse: ESC p 0 25 250
                // ---------------------------------------------------------------
                if (msgType == "CASH_DRAWER_KICK")
                {
                    // ESC/POS cash drawer open pulse sequence
                    byte[] drawerPulse = new byte[] { 0x1B, 0x70, 0x00, 0x19, 0xFA };

                    string? kickConn = root.TryGetProperty("connectionType", out var kct) ? kct.GetString() : null;
                    string? kickPrinter = root.TryGetProperty("printerId", out var kpid) ? kpid.GetString() : null;

                    // Resolve actual printer address from local profile service
                    var receiptPrinter = _profileService.ResolvePrinter(
                        "RECEIPT",
                        _authService.CurrentSession?.ActiveStoreId,
                        _authService.CurrentSession?.Device.DeviceId
                    );

                    bool drawerSuccess = false;
                    string? drawerError = null;

                    try
                    {
                        if (receiptPrinter != null && receiptPrinter.Type == ConnectionType.Serial && !string.IsNullOrEmpty(receiptPrinter.Address))
                        {
                            // Serial port (ESC-POS over COM port)
                            using var port = new System.IO.Ports.SerialPort(receiptPrinter.Address, 9600, System.IO.Ports.Parity.None, 8, System.IO.Ports.StopBits.One);
                            port.WriteTimeout = 2000;
                            if (!port.IsOpen) port.Open();
                            port.Write(drawerPulse, 0, drawerPulse.Length);
                            drawerSuccess = true;
                        }
                        else if (receiptPrinter != null && receiptPrinter.Type == ConnectionType.Network && !string.IsNullOrEmpty(receiptPrinter.Address))
                        {
                            // TCP socket (ESC-POS over network)
                            var parts = receiptPrinter.Address.Split(':');
                            var host = parts[0];
                            var port = parts.Length > 1 && int.TryParse(parts[1], out var p) ? p : 9100;
                            using var client = new System.Net.Sockets.TcpClient();
                            await client.ConnectAsync(host, port);
                            using var stream = client.GetStream();
                            await stream.WriteAsync(drawerPulse, 0, drawerPulse.Length);
                            drawerSuccess = true;
                        }
                        else if (receiptPrinter != null && receiptPrinter.Type == ConnectionType.Windows && !string.IsNullOrEmpty(receiptPrinter.Address))
                        {
                            // Windows Spooler — send raw bytes via RawPrint
                            drawerSuccess = await Task.Run(() => SendRawBytesToWindowsPrinter(receiptPrinter.Address, drawerPulse));
                        }
                        else
                        {
                            drawerError = "No configured receipt printer for cash drawer kick";
                        }
                    }
                    catch (Exception dex)
                    {
                        drawerError = dex.Message;
                        System.Diagnostics.Debug.WriteLine($"[CashDrawerKick] Error: {dex.Message}");
                    }

                    webView.CoreWebView2?.PostWebMessageAsJson(JsonSerializer.Serialize(new
                    {
                        type = "CASH_DRAWER_KICK_RESULT",
                        success = drawerSuccess,
                        error = drawerError
                    }));
                    return;
                }

                if (msgType == "PRINT_PAYLOAD" || msgType == "PRINT_ESC_POS" || msgType == "PRINT_HTML_RECEIPT")
                {
                    NormalizedPrintPayload? payload = null;

                    if (root.TryGetProperty("payload", out var pElem))
                    {
                        var rawPayload = pElem.GetRawText();
                        if (pElem.TryGetProperty("protocolVersion", out var pv) && pv.GetInt32() == 1)
                        {
                            payload = JsonSerializer.Deserialize<NormalizedPrintPayload>(rawPayload);
                        }
                        else
                        {
                            var legacyOrder = JsonSerializer.Deserialize<OrderData>(rawPayload);
                            if (legacyOrder != null)
                            {
                                payload = NormalizedPrintPayload.FromLegacyOrder(legacyOrder);
                            }
                        }
                    }

                    if (payload != null)
                    {
                        if (_authService.CurrentSession != null)
                        {
                            if (string.IsNullOrEmpty(payload.StoreId)) payload.StoreId = _authService.CurrentSession.ActiveStoreId;
                            if (string.IsNullOrEmpty(payload.CompanyId)) payload.CompanyId = _authService.CurrentSession.Company.Id;
                            payload.DeviceId = _authService.CurrentSession.Device.DeviceId;
                        }

                        var result = await _printManager.ProcessPrintJobAsync(payload);

                        // Non-blocking response back to WebView2
                        webView.CoreWebView2?.PostWebMessageAsJson(JsonSerializer.Serialize(new
                        {
                            type = "PRINT_STATUS",
                            status = result.Success ? "SUCCESS" : "FAILED",
                            jobId = result.JobId,
                            error = result.ErrorMessage
                        }));

                        Dispatcher.Invoke(() => UpdatePrinterStatusBadge());
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[WebMessageReceived] Error: {ex.Message}");
            }
        }

        private static string GetOfflineOutboxFilePath()
        {
            var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            return Path.Combine(dir, "offline-outbox.json");
        }

        private static void SaveOfflineOutboxEntryToDisk(JsonElement entry)
        {
            try
            {
                var filePath = GetOfflineOutboxFilePath();
                var dict = new Dictionary<string, JsonElement>();
                if (File.Exists(filePath))
                {
                    var existingJson = File.ReadAllText(filePath);
                    if (!string.IsNullOrWhiteSpace(existingJson))
                    {
                        using var doc = JsonDocument.Parse(existingJson);
                        if (doc.RootElement.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var item in doc.RootElement.EnumerateArray())
                            {
                                var id = item.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;
                                if (!string.IsNullOrEmpty(id))
                                {
                                    dict[id!] = item.Clone();
                                }
                            }
                        }
                    }
                }

                var entryId = entry.TryGetProperty("id", out var eid) ? eid.GetString() : Guid.NewGuid().ToString();
                if (!string.IsNullOrEmpty(entryId))
                {
                    dict[entryId!] = entry.Clone();
                }

                var updatedJson = JsonSerializer.Serialize(dict.Values.ToList(), new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(filePath, updatedJson);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[OfflineOutbox] Save failed: {ex.Message}");
            }
        }

        private static List<JsonElement> LoadOfflineOutboxEntriesFromDisk()
        {
            var list = new List<JsonElement>();
            try
            {
                var filePath = GetOfflineOutboxFilePath();
                if (!File.Exists(filePath)) return list;
                var json = File.ReadAllText(filePath);
                if (string.IsNullOrWhiteSpace(json)) return list;
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in doc.RootElement.EnumerateArray())
                    {
                        var status = item.TryGetProperty("status", out var s) ? s.GetString() : "PENDING";
                        if (status != "SYNCED")
                        {
                            list.Add(item.Clone());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[OfflineOutbox] Load failed: {ex.Message}");
            }
            return list;
        }

        /// <summary>
        /// Sends raw bytes directly to a Windows Spooler printer (bypasses GDI).
        /// Used for ESC/POS cash drawer kick via Windows driver-connected printers.
        /// </summary>
        private static bool SendRawBytesToWindowsPrinter(string printerName, byte[] data)
        {
            try
            {
                // Win32 RawPrint via winspool.drv
                IntPtr hPrinter = IntPtr.Zero;
                var di = new DOCINFO { pDocName = "CashDrawerKick", pDataType = "RAW" };

                if (!OpenPrinter(printerName.Normalize(), out hPrinter, IntPtr.Zero)) return false;

                try
                {
                    if (!StartDocPrinter(hPrinter, 1, ref di)) return false;
                    if (!StartPagePrinter(hPrinter)) { EndDocPrinter(hPrinter); return false; }

                    WritePrinter(hPrinter, data, data.Length, out _);
                    EndPagePrinter(hPrinter);
                    EndDocPrinter(hPrinter);
                    return true;
                }
                finally
                {
                    ClosePrinter(hPrinter);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[RawPrint] CashDrawer failed: {ex.Message}");
                return false;
            }
        }

        // Win32 P/Invoke declarations for raw printer access
        [System.Runtime.InteropServices.DllImport("winspool.drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = System.Runtime.InteropServices.CharSet.Ansi)]
        private static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

        [System.Runtime.InteropServices.DllImport("winspool.drv", EntryPoint = "ClosePrinter", SetLastError = true)]
        private static extern bool ClosePrinter(IntPtr hPrinter);

        [System.Runtime.InteropServices.DllImport("winspool.drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = System.Runtime.InteropServices.CharSet.Ansi)]
        private static extern bool StartDocPrinter(IntPtr hPrinter, int level, [System.Runtime.InteropServices.In, System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPStruct)] ref DOCINFO di);

        [System.Runtime.InteropServices.DllImport("winspool.drv", EntryPoint = "EndDocPrinter", SetLastError = true)]
        private static extern bool EndDocPrinter(IntPtr hPrinter);

        [System.Runtime.InteropServices.DllImport("winspool.drv", EntryPoint = "StartPagePrinter", SetLastError = true)]
        private static extern bool StartPagePrinter(IntPtr hPrinter);

        [System.Runtime.InteropServices.DllImport("winspool.drv", EntryPoint = "EndPagePrinter", SetLastError = true)]
        private static extern bool EndPagePrinter(IntPtr hPrinter);

        [System.Runtime.InteropServices.DllImport("winspool.drv", EntryPoint = "WritePrinter", SetLastError = true)]
        private static extern bool WritePrinter(IntPtr hPrinter, byte[] pBytes, int dwCount, out int dwWritten);

        [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential, CharSet = System.Runtime.InteropServices.CharSet.Ansi)]
        private struct DOCINFO
        {
            [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPStr)] public string pDocName;
            [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPStr)] public string? pOutputFile;
            [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPStr)] public string pDataType;
        }

        private void Window_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
            {
                DragMove();
            }
        }

        private void Minimize_Click(object sender, RoutedEventArgs e) => WindowState = WindowState.Minimized;
        private void Maximize_Click(object sender, RoutedEventArgs e) => WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
        private void Close_Click(object sender, RoutedEventArgs e) => Close();

        private void Retry_Click(object sender, RoutedEventArgs e)
        {
            OfflineSection.Visibility = Visibility.Collapsed;
            SplashSection.Visibility = Visibility.Visible;
            MainWindow_Loaded(this, e);
        }

        private void TabCredentials_Click(object sender, RoutedEventArgs e)
        {
            _isStaffPinTab = false;
            CredentialsForm.Visibility = Visibility.Visible;
            StaffPinForm.Visibility = Visibility.Collapsed;
            TabCredentialsBtn.Opacity = 1.0;
            TabPinBtn.Opacity = 0.5;
        }

        private void TabPin_Click(object sender, RoutedEventArgs e)
        {
            _isStaffPinTab = true;
            CredentialsForm.Visibility = Visibility.Collapsed;
            StaffPinForm.Visibility = Visibility.Visible;
            TabCredentialsBtn.Opacity = 0.5;
            TabPinBtn.Opacity = 1.0;
        }

        private async void LoginSubmit_Click(object sender, RoutedEventArgs e)
        {
            LoginErrorBanner.Visibility = Visibility.Collapsed;
            LoginSubmitBtn.IsEnabled = false;
            LoginLoadingBar.Visibility = Visibility.Visible;

            bool success;
            string message;
            AppSession? session;

            if (!_isStaffPinTab)
            {
                var email = LoginEmailInput.Text.Trim();
                var password = LoginPasswordInput.Password;

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    LoginErrorText.Text = "Please enter both email and password.";
                    LoginErrorBanner.Visibility = Visibility.Visible;
                    LoginSubmitBtn.IsEnabled = true;
                    LoginLoadingBar.Visibility = Visibility.Collapsed;
                    return;
                }

                (success, message, session) = await _authService.LoginAsync(email, password);
            }
            else
            {
                var pin = LoginStaffPinInput.Password.Trim();
                if (string.IsNullOrEmpty(pin))
                {
                    LoginErrorText.Text = "Please enter your Staff POS PIN code.";
                    LoginErrorBanner.Visibility = Visibility.Visible;
                    LoginSubmitBtn.IsEnabled = true;
                    LoginLoadingBar.Visibility = Visibility.Collapsed;
                    return;
                }

                (success, message, session) = await _authService.StaffLoginAsync(pin);
            }

            LoginSubmitBtn.IsEnabled = true;
            LoginLoadingBar.Visibility = Visibility.Collapsed;

            if (success && session != null)
            {
                LoadStorePosInWebView();
            }
            else
            {
                LoginErrorText.Text = message;
                LoginErrorBanner.Visibility = Visibility.Visible;
            }
        }

        private void Logout_Click(object sender, RoutedEventArgs e)
        {
            var res = MessageBox.Show("Are you sure you want to sign out?", "Confirm Sign Out", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (res == MessageBoxResult.Yes)
            {
                _authService.Logout();
            }
        }

        private void OpenSettings_Click(object sender, RoutedEventArgs e)
        {
            var session = _authService.CurrentSession;
            if (session != null && webView.CoreWebView2 != null)
            {
                var companySlug = session.Company?.Slug ?? "admin";
                var url = $"{_authService.BaseUrl}/admin/{companySlug}/settings/devices-printing?token={session.Token}&storeId={session.ActiveStoreId}&deviceId={session.Device.DeviceId}&platform=WPF";
                webView.CoreWebView2.Navigate(url);
            }
            else
            {
                RefreshPrintersList();
                SettingsOverlay.Visibility = Visibility.Visible;
            }
        }

        private void CloseSettings_Click(object sender, RoutedEventArgs e)
        {
            SettingsOverlay.Visibility = Visibility.Collapsed;
            UpdatePrinterStatusBadge();
        }

        private void RefreshPrintersList()
        {
            var profiles = _profileService.GetAllProfiles();
            ConfiguredPrintersList.ItemsSource = null;
            ConfiguredPrintersList.ItemsSource = profiles;

            if (profiles.Count > 0 && ConfiguredPrintersList.SelectedItem == null)
            {
                ConfiguredPrintersList.SelectedIndex = 0;
            }
        }

        private void ConfiguredPrintersList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (ConfiguredPrintersList.SelectedItem is PrinterConnection p)
            {
                _selectedConfigPrinter = p;
                PrinterIdentifierInput.Text = p.Address;
                PrinterTypeCombo.SelectedIndex = (int)p.Type;
                PaperWidthCombo.SelectedIndex = p.PaperWidth == "58mm" ? 0 : (p.PaperWidth == "A4" ? 2 : 1);
                PrinterPurposeCombo.SelectedIndex = p.Purpose == "INVOICE" ? 1 : (p.Purpose == "KITCHEN" ? 2 : (p.Purpose == "BAR" ? 3 : 0));
            }
        }

        private void ScanPrinters_Click(object sender, RoutedEventArgs e)
        {
            var winPrinters = _discoveryService.GetInstalledWindowsPrinters();
            var serialPrinters = _discoveryService.GetSerialPorts();

            var all = new List<PrinterConnection>();
            all.AddRange(winPrinters);
            all.AddRange(serialPrinters);

            FoundPrintersList.ItemsSource = all;
            if (all.Count > 0)
            {
                FoundPrintersList.SelectedIndex = 0;
            }
        }

        private void FoundPrintersList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (FoundPrintersList.SelectedItem is PrinterConnection p)
            {
                PrinterIdentifierInput.Text = p.Address;
                PrinterTypeCombo.SelectedIndex = (int)p.Type;
            }
        }

        private async void TestPrinter_Click(object sender, RoutedEventArgs e)
        {
            var p = _selectedConfigPrinter ?? CreateFromInputs();
            if (p == null || string.IsNullOrEmpty(p.Address))
            {
                MessageBox.Show("Please select or enter printer details.", "Test Printer", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            var storeName = _authService.CurrentSession?.ActiveStore?.Name ?? "Main Branch";
            var deviceName = _authService.CurrentSession?.Device.DeviceName ?? Environment.MachineName;

            var (success, error) = await _printerService.PrintTestSlipAsync(p, storeName, deviceName);
            if (success)
            {
                MessageBox.Show("Test slip printed successfully!", "Test Print OK", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            else
            {
                MessageBox.Show($"Test print failed:\n{error}", "Test Print Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void SetDefaultPrinter_Click(object sender, RoutedEventArgs e)
        {
            if (_selectedConfigPrinter != null)
            {
                _selectedConfigPrinter.IsDefault = true;
                _profileService.SaveProfile(_selectedConfigPrinter);
                RefreshPrintersList();
                UpdatePrinterStatusBadge();
                MessageBox.Show($"'{_selectedConfigPrinter.Name}' set as default receipt printer.", "Default Printer", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void RemovePrinter_Click(object sender, RoutedEventArgs e)
        {
            if (_selectedConfigPrinter != null)
            {
                _profileService.DeleteProfile(_selectedConfigPrinter.Id);
                _selectedConfigPrinter = null;
                RefreshPrintersList();
                UpdatePrinterStatusBadge();
            }
        }

        private void SavePrinter_Click(object sender, RoutedEventArgs e)
        {
            var p = _selectedConfigPrinter ?? new PrinterConnection();
            p.Address = PrinterIdentifierInput.Text.Trim();
            p.Name = !string.IsNullOrEmpty(p.Address) ? p.Address : "Printer";
            p.Type = (ConnectionType)PrinterTypeCombo.SelectedIndex;
            p.PaperWidth = (PaperWidthCombo.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "80mm";
            p.Purpose = (PrinterPurposeCombo.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "RECEIPT";

            if (_authService.CurrentSession != null)
            {
                p.StoreId = _authService.CurrentSession.ActiveStoreId;
                p.DeviceId = _authService.CurrentSession.Device.DeviceId;
            }

            _profileService.SaveProfile(p);
            RefreshPrintersList();
            UpdatePrinterStatusBadge();
            MessageBox.Show("Printer configuration saved.", "Hardware Saved", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private PrinterConnection CreateFromInputs()
        {
            return new PrinterConnection
            {
                Address = PrinterIdentifierInput.Text.Trim(),
                Name = PrinterIdentifierInput.Text.Trim(),
                Type = (ConnectionType)PrinterTypeCombo.SelectedIndex,
                PaperWidth = (PaperWidthCombo.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "80mm",
                Purpose = (PrinterPurposeCombo.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "RECEIPT"
            };
        }
    }
}
