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

            var companySlug = session.Company.Slug ?? "admin";
            var storeId = session.ActiveStoreId ?? "";
            var deviceId = session.Device.DeviceId ?? "";

            var url = $"{_authService.BaseUrl}/admin/{companySlug}/storepos?token={session.Token}&storeId={storeId}&deviceId={deviceId}&platform=WPF";

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
                        if (!result.Success && !result.IsDuplicate)
                        {
                            MessageBox.Show($"Print failed: {result.ErrorMessage}", "Printer Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[WebMessageReceived] Error: {ex.Message}");
            }
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
            RefreshPrintersList();
            SettingsOverlay.Visibility = Visibility.Visible;
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
