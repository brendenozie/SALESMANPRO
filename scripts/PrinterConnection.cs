using System;
using System.Text.Json.Serialization;

namespace SalesmanProDesktop.Models
{
    public enum ConnectionType
    {
        Windows,
        Usb,
        Network,
        Bluetooth,
        Serial
    }

    public class PrinterConnection
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string Name { get; set; } = "";
        public ConnectionType Type { get; set; } = ConnectionType.Windows;
        public string Address { get; set; } = "";
        public int Port { get; set; } = 9100;
        public int BaudRate { get; set; } = 9600;

        public string Purpose { get; set; } = "RECEIPT";
        public string PaperWidth { get; set; } = "80mm";
        public string StoreId { get; set; } = "";
        public string DeviceId { get; set; } = "";
        public bool IsDefault { get; set; } = false;

        // Legacy compatibility properties
        public string Identifier
        {
            get => Address;
            set => Address = value;
        }

        public bool IsConfigured => !string.IsNullOrEmpty(Name) || !string.IsNullOrEmpty(Address);

        public override string ToString()
        {
            return $"{Name} ({Type} - {Purpose} - {PaperWidth})";
        }
    }
}
