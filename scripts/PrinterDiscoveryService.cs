using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.IO.Ports;
using System.Net.NetworkInformation;
using System.Threading.Tasks;
using SalesmanProDesktop.Models;

namespace SalesmanProDesktop.Services
{
    public class PrinterDiscoveryService
    {
        public List<PrinterConnection> GetInstalledWindowsPrinters()
        {
            var list = new List<PrinterConnection>();
            try
            {
                foreach (string printerName in PrinterSettings.InstalledPrinters)
                {
                    list.Add(new PrinterConnection
                    {
                        Name = printerName,
                        Type = ConnectionType.Windows,
                        Address = printerName,
                        PaperWidth = "80mm",
                        Purpose = "RECEIPT"
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[PrinterDiscovery] Windows printer scan error: {ex.Message}");
            }
            return list;
        }

        public List<PrinterConnection> GetSerialPorts()
        {
            var list = new List<PrinterConnection>();
            try
            {
                foreach (string port in SerialPort.GetPortNames())
                {
                    list.Add(new PrinterConnection
                    {
                        Name = $"Serial / Bluetooth ({port})",
                        Type = ConnectionType.Serial,
                        Address = port,
                        BaudRate = 9600,
                        PaperWidth = "58mm",
                        Purpose = "RECEIPT"
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[PrinterDiscovery] Serial port scan error: {ex.Message}");
            }
            return list;
        }

        public async Task<List<PrinterConnection>> DiscoverNetworkPrintersAsync(string subnetBase = "192.168.1", int port = 9100)
        {
            var list = new List<PrinterConnection>();
            return await Task.Run(() =>
            {
                try
                {
                    int[] commonIps = new int[] { 100, 101, 102, 105, 110, 120, 150, 192, 200, 201 };
                    foreach (var lastOctet in commonIps)
                    {
                        var ip = $"{subnetBase}.{lastOctet}";
                        using var ping = new Ping();
                        var reply = ping.Send(ip, 150);
                        if (reply.Status == IPStatus.Success)
                        {
                            list.Add(new PrinterConnection
                            {
                                Name = $"Network Thermal ({ip}:{port})",
                                Type = ConnectionType.Network,
                                Address = ip,
                                Port = port,
                                PaperWidth = "80mm",
                                Purpose = "RECEIPT"
                            });
                        }
                    }
                }
                catch { }
                return list;
            });
        }
    }
}
