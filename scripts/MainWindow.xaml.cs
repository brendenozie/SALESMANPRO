using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;
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

        private PrinterConnection? _selectedHardwarePrinter;

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
            await InitializeWebViewAsync();

            // Try restoring existing secure session
            var restored = _authService.RestorePersistedSession();
            if (restored != null)
            {
                ApplySessionUi(restored);
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

        private async System.Threading.Tasks.Task InitializeWebViewAsync()
        {
            try
            {
                var userDataFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro", "WebView2");
                var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
                await WebBrowser.EnsureCoreWebView2Async(env);

                WebBrowser.CoreWebView2.Settings.IsStatusBarEnabled = false;
                WebBrowser.CoreWebView2.Settings.AreDevToolsEnabled = true;

                WebBrowser.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize WebView2: {ex.Message}", "WebView2 Initialization Error", MessageBoxButton.OK, MessageBoxImage.Error);
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
            UserBadge.Text = session.User.Name;
            CompanyBadge.Text = session.Company.Name;
            RoleBadge.Text = session.User.Role.ToUpper();

            StoreSelector.ItemsSource = session.Stores;
            StoreSelector.SelectedValue = session.ActiveStoreId;
            if (StoreSelector.SelectedItem == null && session.Stores.Count > 0)
            {
                StoreSelector.SelectedIndex = 0;
            }
        }

        private void ShowLoginOverlay()
        {
            LoginOverlay.Visibility = Visibility.Visible;
            LoginErrorText.Visibility = Visibility.Collapsed;
        }

        private void LoadStorePosInWebView()
        {
            var session = _authService.CurrentSession;
            if (session == null || string.IsNullOrEmpty(session.Token)) return;

            var companySlug = session.Company.Slug ?? "admin";
            var url = $"{_authService.BaseUrl}/admin/{companySlug}/storepos?token={session.Token}&storeId={session.ActiveStoreId}&deviceId={session.Device.DeviceId}&platform=WPF";

            if (WebBrowser.CoreWebView2 != null)
            {
                WebBrowser.CoreWebView2.Navigate(url);
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

                if (msgType == "PRINT_PAYLOAD" || msgType == "PRINT_ESC_POS" || msgType == "PRINT_HTML_RECEIPT")
                {
                    NormalizedPrintPayload? payload = null;

                    if (root.TryGetProperty("payload", out var pElem))
                    {
                        var rawPayload = pElem.GetRawText();

                        // Check if normalized v1
                        if (pElem.TryGetProperty("protocolVersion", out var pv) && pv.GetInt32() == 1)
                        {
                            payload = JsonSerializer.Deserialize<NormalizedPrintPayload>(rawPayload);
                        }
                        else
                        {
                            // Legacy fallback
                            var legacyOrder = JsonSerializer.Deserialize<OrderData>(rawPayload);
                            if (legacyOrder != null)
                            {
                                payload = NormalizedPrintPayload.FromLegacyOrder(legacyOrder);
                            }
                        }
                    }

                    if (payload != null)
                    {
                        // Fill device & store context from desktop session
                        if (_authService.CurrentSession != null)
                        {
                            if (string.IsNullOrEmpty(payload.StoreId)) payload.StoreId = _authService.CurrentSession.ActiveStoreId;
                            if (string.IsNullOrEmpty(payload.CompanyId)) payload.CompanyId = _authService.CurrentSession.Company.Id;
                            payload.DeviceId = _authService.CurrentSession.Device.DeviceId;
                        }

                        var result = await _printManager.ProcessPrintJobAsync(payload);

                        if (!result.Success)
                        {
                            MessageBox.Show($"Print failed: {result.ErrorMessage}", "Printer Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[WebMessageReceived] Error parsing print message: {ex.Message}");
            }
        }

        private async void BtnLogin_Click(object sender, RoutedEventArgs e)
        {
            LoginErrorText.Visibility = Visibility.Collapsed;
            var email = TxtEmail.Text.Trim();
            var password = TxtPassword.Password;

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                LoginErrorText.Text = "Please enter both email and password.";
                LoginErrorText.Visibility = Visibility.Visible;
                return;
            }

            BtnLogin.IsEnabled = false;
            BtnLogin.Content = "Signing In...";

            var (success, message, session) = await _authService.LoginAsync(email, password);

            BtnLogin.IsEnabled = true;
            BtnLogin.Content = "Sign In with Credentials";

            if (success && session != null)
            {
                LoadStorePosInWebView();
            }
            else
            {
                LoginErrorText.Text = message;
                LoginErrorText.Visibility = Visibility.Visible;
            }
        }

        private async void BtnStaffLogin_Click(object sender, RoutedEventArgs e)
        {
            LoginErrorText.Visibility = Visibility.Collapsed;
            var pin = TxtStaffCode.Password.Trim();

            if (string.IsNullOrEmpty(pin))
            {
                LoginErrorText.Text = "Please enter your Staff POS Code / PIN.";
                LoginErrorText.Visibility = Visibility.Visible;
                return;
            }

            BtnStaffLogin.IsEnabled = false;
            BtnStaffLogin.Content = "Verifying PIN...";

            var (success, message, session) = await _authService.StaffLoginAsync(pin);

            BtnStaffLogin.IsEnabled = true;
            BtnStaffLogin.Content = "Sign In with Staff PIN";

            if (success && session != null)
            {
                LoadStorePosInWebView();
            }
            else
            {
                LoginErrorText.Text = message;
                LoginErrorText.Visibility = Visibility.Visible;
            }
        }

        private void StoreSelector_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (StoreSelector.SelectedValue is string storeId && !string.IsNullOrEmpty(storeId))
            {
                _authService.SetActiveStore(storeId);
                LoadStorePosInWebView();
            }
        }

        private void BtnHardware_Click(object sender, RoutedEventArgs e)
        {
            LoadHardwareProfiles();
            HardwareModal.Visibility = Visibility.Visible;
        }

        private void BtnCloseHardware_Click(object sender, RoutedEventArgs e)
        {
            HardwareModal.Visibility = Visibility.Collapsed;
        }

        private void LoadHardwareProfiles()
        {
            var profiles = _profileService.GetAllProfiles();
            ListPrinters.ItemsSource = null;
            ListPrinters.ItemsSource = profiles;

            if (profiles.Count > 0 && ListPrinters.SelectedItem == null)
            {
                ListPrinters.SelectedIndex = 0;
            }
        }

        private void ListPrinters_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (ListPrinters.SelectedItem is PrinterConnection p)
            {
                _selectedHardwarePrinter = p;
                TxtPrinterName.Text = p.Name;
                ComboConnType.SelectedIndex = (int)p.Type;
                TxtPrinterAddress.Text = p.Address;
                TxtPrinterPort.Text = p.Port.ToString();
                ComboWidth.SelectedIndex = p.PaperWidth == "58mm" ? 0 : (p.PaperWidth == "A4" ? 2 : 1);
                ComboPurpose.SelectedIndex = p.Purpose == "INVOICE" ? 1 : (p.Purpose == "KITCHEN" ? 2 : (p.Purpose == "BAR" ? 3 : 0));
                ChkIsDefault.IsChecked = p.IsDefault;
            }
        }

        private void BtnSavePrinter_Click(object sender, RoutedEventArgs e)
        {
            var p = _selectedHardwarePrinter ?? new PrinterConnection();
            p.Name = TxtPrinterName.Text.Trim();
            p.Type = (ConnectionType)ComboConnType.SelectedIndex;
            p.Address = TxtPrinterAddress.Text.Trim();
            if (int.TryParse(TxtPrinterPort.Text.Trim(), out var port)) p.Port = port;

            p.PaperWidth = (ComboWidth.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "80mm";
            p.Purpose = (ComboPurpose.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "RECEIPT";
            p.IsDefault = ChkIsDefault.IsChecked == true;

            if (_authService.CurrentSession != null)
            {
                p.StoreId = _authService.CurrentSession.ActiveStoreId;
                p.DeviceId = _authService.CurrentSession.Device.DeviceId;
            }

            _profileService.SaveProfile(p);
            LoadHardwareProfiles();
            MessageBox.Show("Printer settings saved successfully.", "Hardware Settings", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void BtnDeletePrinter_Click(object sender, RoutedEventArgs e)
        {
            if (_selectedHardwarePrinter != null)
            {
                _profileService.DeleteProfile(_selectedHardwarePrinter.Id);
                _selectedHardwarePrinter = null;
                LoadHardwareProfiles();
            }
        }

        private async void BtnTestPrint_Click(object sender, RoutedEventArgs e)
        {
            if (_selectedHardwarePrinter == null)
            {
                MessageBox.Show("Please select or save a printer configuration first.", "Test Print", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            var storeName = _authService.CurrentSession?.ActiveStore?.Name ?? "Main Branch";
            var deviceName = _authService.CurrentSession?.Device?.DeviceName ?? Environment.MachineName;

            var (success, error) = await _printerService.PrintTestSlipAsync(_selectedHardwarePrinter, storeName, deviceName);
            if (success)
            {
                MessageBox.Show("Test slip printed successfully!", "Test Print OK", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            else
            {
                MessageBox.Show($"Test print failed:\n{error}", "Test Print Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnScanPrinters_Click(object sender, RoutedEventArgs e)
        {
            var windowsPrinters = _discoveryService.GetInstalledWindowsPrinters();
            var serialPorts = _discoveryService.GetSerialPorts();

            var combined = new List<PrinterConnection>();
            combined.AddRange(windowsPrinters);
            combined.AddRange(serialPorts);

            if (combined.Count > 0)
            {
                foreach (var found in combined)
                {
                    _profileService.SaveProfile(found);
                }
                LoadHardwareProfiles();
                MessageBox.Show($"Found and added {combined.Count} local printer device(s).", "Scan Complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            else
            {
                MessageBox.Show("No new printers detected via Windows spooler or Serial/Bluetooth ports.", "Scan Complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void BtnLogout_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Are you sure you want to sign out?", "Confirm Sign Out", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (result == MessageBoxResult.Yes)
            {
                _authService.Logout();
            }
        }

        private void TabEmail_Click(object sender, RoutedEventArgs e)
        {
            EmailLoginForm.Visibility = Visibility.Visible;
            StaffLoginForm.Visibility = Visibility.Collapsed;
        }

        private void TabStaff_Click(object sender, RoutedEventArgs e)
        {
            EmailLoginForm.Visibility = Visibility.Collapsed;
            StaffLoginForm.Visibility = Visibility.Visible;
        }
    }
}
