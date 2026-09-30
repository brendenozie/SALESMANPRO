using System;
using System.Collections.Generic;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using SalesmanProDesktop.Models;
using SalesmanProDesktop.Services;

namespace SalesmanProDesktop.Views
{
    public partial class SettingsView : UserControl
    {
        private readonly SettingsService _settingsService = new SettingsService();

        public SettingsView()
        {
            InitializeComponent();
            LoadCurrentSettings();
        }

        private void LoadCurrentSettings()
        {
            var settings = _settingsService.Load();
            if (settings?.ReceiptPrinter != null)
            {
                IpInput.Text = settings.ReceiptPrinter.Identifier;
                foreach (ComboBoxItem item in TypeSelector.Items)
                {
                    if (item.Content.ToString() == settings.ReceiptPrinter.Type.ToString())
                        TypeSelector.SelectedItem = item;
                }
            }
        }

        private async void Scan_Click(object sender, RoutedEventArgs e)
        {
            BtnScan.IsEnabled = false;
            ScanProgress.Visibility = Visibility.Visible;
            FoundDevicesList.Items.Clear();

            var foundIps = await Task.Run(async () => await DiscoverPrinters());

            foreach (var ip in foundIps)
            {
                FoundDevicesList.Items.Add(ip);
            }

            ScanProgress.Visibility = Visibility.Collapsed;
            BtnScan.IsEnabled = true;

            if (foundIps.Count == 0)
                MessageBox.Show("No printers found on port 9100.");
        }

        private async Task<List<string>> DiscoverPrinters()
        {
            var results = new List<string>();
            string subnet = "192.168.1";

            var tasks = new List<Task>();
            for (int i = 1; i < 255; i++)
            {
                string ip = $"{subnet}.{i}";
                tasks.Add(Task.Run(() =>
                {
                    try
                    {
                        using var client = new TcpClient();
                        var result = client.BeginConnect(ip, 9100, null, null);
                        bool success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromMilliseconds(150));
                        if (success && client.Connected)
                        {
                            lock (results) results.Add(ip);
                        }
                    }
                    catch { }
                }));
            }
            await Task.WhenAll(tasks);
            return results;
        }

        private void Device_Selected(object sender, SelectionChangedEventArgs e)
        {
            if (FoundDevicesList.SelectedItem != null)
            {
                IpInput.Text = FoundDevicesList.SelectedItem.ToString();
            }
        }

        private void Save_Click(object sender, RoutedEventArgs e)
        {
            var settings = _settingsService.Load();

            var typeStr = (TypeSelector.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "Windows";
            Enum.TryParse<ConnectionType>(typeStr, true, out var parsedType);

            settings.ReceiptPrinter = new PrinterConnection
            {
                Type = parsedType,
                Identifier = IpInput.Text,
                Port = 9100,
                Name = "Main Receipt Printer"
            };

            _settingsService.Save(settings);
            MessageBox.Show("Printer settings saved and applied!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }
}
