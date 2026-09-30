using System;
using System.Drawing;
using System.Drawing.Printing;
using System.IO;
using System.IO.Ports;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using SalesmanProDesktop.Models;

namespace SalesmanProDesktop.Services
{
    public class PrinterService
    {
        public static readonly byte[] ESC_INIT = new byte[] { 0x1B, 0x40 };
        public static readonly byte[] ESC_ALIGN_LEFT = new byte[] { 0x1B, 0x61, 0x00 };
        public static readonly byte[] ESC_ALIGN_CENTER = new byte[] { 0x1B, 0x61, 0x01 };
        public static readonly byte[] ESC_ALIGN_RIGHT = new byte[] { 0x1B, 0x61, 0x02 };
        public static readonly byte[] ESC_BOLD_ON = new byte[] { 0x1B, 0x45, 0x01 };
        public static readonly byte[] ESC_BOLD_OFF = new byte[] { 0x1B, 0x45, 0x00 };
        public static readonly byte[] ESC_DOUBLE_ON = new byte[] { 0x1D, 0x21, 0x11 };
        public static readonly byte[] ESC_DOUBLE_OFF = new byte[] { 0x1D, 0x21, 0x00 };
        public static readonly byte[] ESC_FEED_AND_CUT = new byte[] { 0x1D, 0x56, 0x41, 0x03 };
        public static readonly byte[] ESC_OPEN_DRAWER = new byte[] { 0x1B, 0x70, 0x00, 0x19, 0xFA };

        public async Task<(bool success, string? error)> PrintPayloadAsync(NormalizedPrintPayload payload, PrinterConnection printer)
        {
            if (payload == null || payload.Document == null)
            {
                return (false, "Print payload is null or invalid.");
            }

            if (!printer.IsConfigured)
            {
                return (false, "Target printer is not configured.");
            }

            try
            {
                if (printer.Type == ConnectionType.Windows)
                {
                    var printed = PrintViaWindowsSpooler(payload, printer.Name, out var err);
                    return (printed, err);
                }

                int lineWidth = printer.PaperWidth == "58mm" ? 32 : 48;
                byte[] rawEscPos = BuildEscPosReceipt(payload, lineWidth);

                switch (printer.Type)
                {
                    case ConnectionType.Network:
                        return await SendToNetworkPrinterAsync(printer.Address, printer.Port > 0 ? printer.Port : 9100, rawEscPos);

                    case ConnectionType.Serial:
                    case ConnectionType.Bluetooth:
                        return await SendToSerialPrinterAsync(printer.Address, printer.BaudRate > 0 ? printer.BaudRate : 9600, rawEscPos);

                    case ConnectionType.Usb:
                        var winPrinted = PrintViaWindowsSpooler(payload, printer.Name, out var usbErr);
                        return (winPrinted, usbErr);

                    default:
                        return (false, $"Unsupported connection type: {printer.Type}");
                }
            }
            catch (Exception ex)
            {
                return (false, $"Printing failed: {ex.Message}");
            }
        }

        public async Task<(bool success, string? error)> PrintTestSlipAsync(PrinterConnection printer, string storeName, string deviceName)
        {
            var testPayload = new NormalizedPrintPayload
            {
                JobId = "test_" + Guid.NewGuid().ToString("N").Substring(0, 8),
                DocumentType = "TEST_SLIP",
                DocumentId = "TEST-001",
                StoreId = printer.StoreId,
                DeviceId = printer.DeviceId,
                Document = new NormalizedDocument
                {
                    Number = "TEST-SLIP",
                    Date = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                    Customer = new NormalizedCustomer { Name = "Hardware Diagnostics" },
                    CashierName = "System",
                    Totals = new NormalizedPrintTotals
                    {
                        Subtotal = 0,
                        Tax = 0,
                        Total = 0,
                        Paid = 0,
                        Currency = "KES"
                    },
                    Footer = "SalesmanPro Hardware Diagnostics - OK"
                }
            };

            testPayload.Document.Items.Add(new NormalizedPrintItem
            {
                Name = "Printer Connection OK",
                Quantity = 1,
                Price = 0,
                Total = 0
            });

            return await PrintPayloadAsync(testPayload, printer);
        }

        public static byte[] BuildEscPosReceipt(NormalizedPrintPayload payload, int lineWidth)
        {
            using var ms = new MemoryStream();

            // Initialize
            ms.Write(ESC_INIT, 0, ESC_INIT.Length);

            // Open cash drawer if receipt
            if (payload.DocumentType == "RECEIPT")
            {
                ms.Write(ESC_OPEN_DRAWER, 0, ESC_OPEN_DRAWER.Length);
            }

            var doc = payload.Document;
            var enc = Encoding.GetEncoding("ASCII");

            // Header - Center
            ms.Write(ESC_ALIGN_CENTER, 0, ESC_ALIGN_CENTER.Length);
            ms.Write(ESC_BOLD_ON, 0, ESC_BOLD_ON.Length);
            ms.Write(ESC_DOUBLE_ON, 0, ESC_DOUBLE_ON.Length);
            WriteAscii(ms, (doc.OrderType ?? "SALESMANPRO").ToUpperInvariant() + "\n");
            ms.Write(ESC_DOUBLE_OFF, 0, ESC_DOUBLE_OFF.Length);
            ms.Write(ESC_BOLD_OFF, 0, ESC_BOLD_OFF.Length);

            if (payload.IsReprint)
            {
                ms.Write(ESC_BOLD_ON, 0, ESC_BOLD_ON.Length);
                WriteAscii(ms, $"*** DUPLICATE / REPRINT #{payload.ReprintCount} ***\n");
                ms.Write(ESC_BOLD_OFF, 0, ESC_BOLD_OFF.Length);
            }

            WriteAscii(ms, new string('-', lineWidth) + "\n");

            // Left info
            ms.Write(ESC_ALIGN_LEFT, 0, ESC_ALIGN_LEFT.Length);
            WriteAscii(ms, $"Doc #: {doc.Number}\n");
            WriteAscii(ms, $"Date : {doc.Date}\n");
            if (!string.IsNullOrEmpty(doc.CashierName)) WriteAscii(ms, $"Staff: {doc.CashierName}\n");
            if (!string.IsNullOrEmpty(doc.Customer?.Name)) WriteAscii(ms, $"Cust : {doc.Customer.Name}\n");
            if (!string.IsNullOrEmpty(doc.Table)) WriteAscii(ms, $"Table: {doc.Table}\n");

            WriteAscii(ms, new string('-', lineWidth) + "\n");

            // Items (Server Authoritative)
            ms.Write(ESC_BOLD_ON, 0, ESC_BOLD_ON.Length);
            WriteAscii(ms, FormatLine("ITEM", "QTY  TOTAL", lineWidth) + "\n");
            ms.Write(ESC_BOLD_OFF, 0, ESC_BOLD_OFF.Length);
            WriteAscii(ms, new string('-', lineWidth) + "\n");

            foreach (var item in doc.Items)
            {
                string line1 = item.Name;
                string qtyStr = item.Quantity % 1 == 0 ? ((int)item.Quantity).ToString() : item.Quantity.ToString("0.##");
                string line2 = $"{qtyStr}x @{item.Price:N2}";
                string line2Right = item.Total.ToString("N2");

                WriteAscii(ms, line1 + "\n");
                WriteAscii(ms, FormatLine("  " + line2, line2Right, lineWidth) + "\n");
                if (!string.IsNullOrEmpty(item.Notes))
                {
                    WriteAscii(ms, $"  * {item.Notes}\n");
                }
            }

            WriteAscii(ms, new string('-', lineWidth) + "\n");

            // Totals (Server Authoritative - No recalculation!)
            var totals = doc.Totals;
            WriteAscii(ms, FormatLine("SUBTOTAL:", $"{totals.Currency} {totals.Subtotal:N2}", lineWidth) + "\n");

            if (totals.Discount > 0)
            {
                WriteAscii(ms, FormatLine("DISCOUNT:", $"-{totals.Discount:N2}", lineWidth) + "\n");
            }

            if (totals.Tax > 0)
            {
                WriteAscii(ms, FormatLine($"TAX ({totals.TaxRate}%):", $"{totals.Tax:N2}", lineWidth) + "\n");
            }

            if (totals.DeliveryFee > 0)
            {
                WriteAscii(ms, FormatLine("DELIVERY FEE:", $"{totals.DeliveryFee:N2}", lineWidth) + "\n");
            }

            ms.Write(ESC_BOLD_ON, 0, ESC_BOLD_ON.Length);
            WriteAscii(ms, FormatLine("TOTAL:", $"{totals.Currency} {totals.Total:N2}", lineWidth) + "\n");
            ms.Write(ESC_BOLD_OFF, 0, ESC_BOLD_OFF.Length);

            WriteAscii(ms, new string('-', lineWidth) + "\n");

            // Payments
            if (doc.Payments != null && doc.Payments.Count > 0)
            {
                foreach (var pay in doc.Payments)
                {
                    WriteAscii(ms, FormatLine($"PAID ({pay.Method}):", $"{totals.Currency} {pay.Amount:N2}", lineWidth) + "\n");
                }
            }
            else if (totals.Paid > 0)
            {
                WriteAscii(ms, FormatLine("PAID:", $"{totals.Currency} {totals.Paid:N2}", lineWidth) + "\n");
            }

            if (totals.Change > 0)
            {
                WriteAscii(ms, FormatLine("CHANGE:", $"{totals.Currency} {totals.Change:N2}", lineWidth) + "\n");
            }

            if (totals.Balance > 0)
            {
                WriteAscii(ms, FormatLine("BALANCE DUE:", $"{totals.Currency} {totals.Balance:N2}", lineWidth) + "\n");
            }

            // Footer
            WriteAscii(ms, new string('-', lineWidth) + "\n");
            ms.Write(ESC_ALIGN_CENTER, 0, ESC_ALIGN_CENTER.Length);
            WriteAscii(ms, (doc.Footer ?? "Thank you for your business!") + "\n\n");
            WriteAscii(ms, $"Powered by SalesmanPro\n\n\n");

            // Feed and cut
            ms.Write(ESC_FEED_AND_CUT, 0, ESC_FEED_AND_CUT.Length);

            return ms.ToArray();
        }

        private static void WriteAscii(Stream stream, string text)
        {
            var bytes = Encoding.ASCII.GetBytes(text);
            stream.Write(bytes, 0, bytes.Length);
        }

        private static string FormatLine(string left, string right, int width)
        {
            int spaces = width - left.Length - right.Length;
            if (spaces < 1) spaces = 1;
            return left + new string(' ', spaces) + right;
        }

        private static async Task<(bool success, string? error)> SendToNetworkPrinterAsync(string ip, int port, byte[] data)
        {
            try
            {
                using var client = new TcpClient();
                var connectTask = client.ConnectAsync(ip, port);
                var timeoutTask = Task.Delay(4000);
                var completed = await Task.WhenAny(connectTask, timeoutTask);
                if (completed == timeoutTask)
                {
                    return (false, $"Network printer {ip}:{port} connection timed out.");
                }

                using var stream = client.GetStream();
                await stream.WriteAsync(data, 0, data.Length);
                await stream.FlushAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                return (false, $"Network printer error ({ip}:{port}): {ex.Message}");
            }
        }

        private static async Task<(bool success, string? error)> SendToSerialPrinterAsync(string portName, int baudRate, byte[] data)
        {
            return await Task.Run(() =>
            {
                try
                {
                    using var port = new SerialPort(portName, baudRate, Parity.None, 8, StopBits.One);
                    port.Open();
                    port.Write(data, 0, data.Length);
                    port.Close();
                    return (true, null);
                }
                catch (Exception ex)
                {
                    return (false, $"Serial/Bluetooth printer error ({portName}): {ex.Message}");
                }
            });
        }

        private static bool PrintViaWindowsSpooler(NormalizedPrintPayload payload, string printerName, out string? errorMessage)
        {
            errorMessage = null;
            try
            {
                var doc = new PrintDocument();
                doc.PrinterSettings.PrinterName = printerName;

                if (!doc.PrinterSettings.IsValid)
                {
                    errorMessage = $"Windows printer '{printerName}' is not installed or invalid.";
                    return false;
                }

                doc.PrintPage += (sender, e) =>
                {
                    var g = e.Graphics;
                    if (g == null) return;

                    float y = 20;
                    float x = 20;
                    float width = e.PageBounds.Width - 40;

                    using var headerFont = new Font("Arial", 14, FontStyle.Bold);
                    using var subHeaderFont = new Font("Arial", 10, FontStyle.Bold);
                    using var bodyFont = new Font("Arial", 9, FontStyle.Regular);
                    using var totalFont = new Font("Arial", 10, FontStyle.Bold);

                    // Title
                    g.DrawString(payload.Document.OrderType ?? "SALESMANPRO RECEIPT", headerFont, Brushes.Black, x, y);
                    y += 28;

                    if (payload.IsReprint)
                    {
                        g.DrawString($"*** REPRINT #{payload.ReprintCount} ***", subHeaderFont, Brushes.Red, x, y);
                        y += 20;
                    }

                    g.DrawString($"Receipt #: {payload.Document.Number}", bodyFont, Brushes.Black, x, y);
                    y += 18;
                    g.DrawString($"Date: {payload.Document.Date}", bodyFont, Brushes.Black, x, y);
                    y += 18;
                    if (!string.IsNullOrEmpty(payload.Document.CashierName))
                    {
                        g.DrawString($"Cashier: {payload.Document.CashierName}", bodyFont, Brushes.Black, x, y);
                        y += 18;
                    }
                    if (!string.IsNullOrEmpty(payload.Document.Customer?.Name))
                    {
                        g.DrawString($"Customer: {payload.Document.Customer.Name}", bodyFont, Brushes.Black, x, y);
                        y += 18;
                    }

                    y += 10;
                    g.DrawLine(Pens.Black, x, y, x + width, y);
                    y += 10;

                    // Items
                    g.DrawString("ITEM", subHeaderFont, Brushes.Black, x, y);
                    g.DrawString("QTY", subHeaderFont, Brushes.Black, x + width - 250, y);
                    g.DrawString("PRICE", subHeaderFont, Brushes.Black, x + width - 150, y);
                    g.DrawString("TOTAL", subHeaderFont, Brushes.Black, x + width - 50, y);
                    y += 20;

                    foreach (var item in payload.Document.Items)
                    {
                        g.DrawString(item.Name, bodyFont, Brushes.Black, x, y);
                        g.DrawString(item.Quantity.ToString("0.##"), bodyFont, Brushes.Black, x + width - 250, y);
                        g.DrawString(item.Price.ToString("N2"), bodyFont, Brushes.Black, x + width - 150, y);
                        g.DrawString(item.Total.ToString("N2"), bodyFont, Brushes.Black, x + width - 50, y);
                        y += 22;
                    }

                    y += 15;
                    g.DrawLine(Pens.LightGray, x, y, x + width, y);
                    y += 15;

                    // Totals
                    g.DrawString($"SUBTOTAL: {payload.Document.Totals.Subtotal:N2}", bodyFont, Brushes.Black, x + width - 200, y);
                    y += 20;
                    g.DrawString($"TAX ({payload.Document.Totals.TaxRate}%): {payload.Document.Totals.Tax:N2}", bodyFont, Brushes.Black, x + width - 200, y);
                    y += 20;
                    g.DrawString($"TOTAL: {payload.Document.Totals.Currency} {payload.Document.Totals.Total:N2}", totalFont, Brushes.Black, x + width - 200, y);
                    y += 35;

                    g.DrawString(payload.Document.Footer ?? "Thank you for your business!", bodyFont, Brushes.Gray, x, y);
                };

                doc.Print();
                return true;
            }
            catch (Exception ex)
            {
                errorMessage = $"Windows spooler print error: {ex.Message}";
                return false;
            }
        }
    }
}
