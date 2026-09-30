using System.Collections.Generic;

namespace SalesmanProDesktop.Models
{
    public class AppSettings
    {
        public PrinterConnection? SelectedPrinter { get; set; }
        public PrinterConnection? ReceiptPrinter { get; set; }
        public Dictionary<string, PrinterConnection> RoutePrinters { get; set; } = new Dictionary<string, PrinterConnection>();
        public List<PrinterConnection> SavedPrinters { get; set; } = new List<PrinterConnection>();
        public bool AutoPrint { get; set; } = true;
        public string LastBaseUrl { get; set; } = "https://salesmanpro.site";
    }
}
