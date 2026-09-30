using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SalesmanProDesktop.Models
{
    public class NormalizedPrintTotals
    {
        [JsonPropertyName("subtotal")]
        public decimal Subtotal { get; set; }

        [JsonPropertyName("discount")]
        public decimal Discount { get; set; }

        [JsonPropertyName("tax")]
        public decimal Tax { get; set; }

        [JsonPropertyName("taxRate")]
        public decimal TaxRate { get; set; }

        [JsonPropertyName("deliveryFee")]
        public decimal DeliveryFee { get; set; }

        [JsonPropertyName("total")]
        public decimal Total { get; set; }

        [JsonPropertyName("paid")]
        public decimal Paid { get; set; }

        [JsonPropertyName("balance")]
        public decimal Balance { get; set; }

        [JsonPropertyName("change")]
        public decimal Change { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; } = "KES";
    }

    public class NormalizedPrintItem
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";

        [JsonPropertyName("name")]
        public string Name { get; set; } = "";

        [JsonPropertyName("sku")]
        public string? Sku { get; set; }

        [JsonPropertyName("quantity")]
        public decimal Quantity { get; set; }

        [JsonPropertyName("price")]
        public decimal Price { get; set; }

        [JsonPropertyName("discount")]
        public decimal Discount { get; set; }

        [JsonPropertyName("total")]
        public decimal Total { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

        [JsonPropertyName("category")]
        public string? Category { get; set; }
    }

    public class NormalizedCustomer
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("phone")]
        public string? Phone { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("address")]
        public string? Address { get; set; }
    }

    public class NormalizedPaymentInfo
    {
        [JsonPropertyName("method")]
        public string Method { get; set; } = "CASH";

        [JsonPropertyName("amount")]
        public decimal Amount { get; set; }

        [JsonPropertyName("reference")]
        public string? Reference { get; set; }
    }

    public class NormalizedDocument
    {
        [JsonPropertyName("number")]
        public string Number { get; set; } = "";

        [JsonPropertyName("date")]
        public string Date { get; set; } = DateTime.UtcNow.ToString("o");

        [JsonPropertyName("customer")]
        public NormalizedCustomer? Customer { get; set; }

        [JsonPropertyName("cashierName")]
        public string? CashierName { get; set; }

        [JsonPropertyName("staffCode")]
        public string? StaffCode { get; set; }

        [JsonPropertyName("orderType")]
        public string? OrderType { get; set; }

        [JsonPropertyName("table")]
        public string? Table { get; set; }

        [JsonPropertyName("items")]
        public List<NormalizedPrintItem> Items { get; set; } = new List<NormalizedPrintItem>();

        [JsonPropertyName("totals")]
        public NormalizedPrintTotals Totals { get; set; } = new NormalizedPrintTotals();

        [JsonPropertyName("payments")]
        public List<NormalizedPaymentInfo> Payments { get; set; } = new List<NormalizedPaymentInfo>();

        [JsonPropertyName("footer")]
        public string? Footer { get; set; }
    }

    public class NormalizedPrintPayload
    {
        [JsonPropertyName("protocolVersion")]
        public int ProtocolVersion { get; set; } = 1;

        [JsonPropertyName("jobId")]
        public string JobId { get; set; } = Guid.NewGuid().ToString("N");

        [JsonPropertyName("documentType")]
        public string DocumentType { get; set; } = "RECEIPT";

        [JsonPropertyName("documentId")]
        public string DocumentId { get; set; } = "";

        [JsonPropertyName("companyId")]
        public string CompanyId { get; set; } = "";

        [JsonPropertyName("storeId")]
        public string StoreId { get; set; } = "";

        [JsonPropertyName("deviceId")]
        public string? DeviceId { get; set; }

        [JsonPropertyName("createdAt")]
        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");

        [JsonPropertyName("isReprint")]
        public bool IsReprint { get; set; } = false;

        [JsonPropertyName("reprintCount")]
        public int ReprintCount { get; set; } = 0;

        [JsonPropertyName("document")]
        public NormalizedDocument Document { get; set; } = new NormalizedDocument();

        public static NormalizedPrintPayload FromLegacyOrder(OrderData legacy)
        {
            var p = new NormalizedPrintPayload
            {
                JobId = !string.IsNullOrEmpty(legacy.ReceiptNumber) ? ("legacy_" + legacy.ReceiptNumber) : ("job_" + Guid.NewGuid().ToString("N")),
                DocumentType = "RECEIPT",
                DocumentId = legacy.ReceiptNumber ?? "",
                Document = new NormalizedDocument
                {
                    Number = legacy.ReceiptNumber ?? "ORD-LEGACY",
                    Date = legacy.Date ?? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                    Customer = new NormalizedCustomer { Name = legacy.CustomerName },
                    CashierName = legacy.StaffName,
                    Totals = new NormalizedPrintTotals
                    {
                        Subtotal = legacy.Subtotal,
                        Tax = legacy.TaxAmount,
                        TaxRate = legacy.TaxRate * 100,
                        Discount = 0,
                        DeliveryFee = 0,
                        Total = legacy.Total,
                        Paid = legacy.Total + legacy.ChangeGiven,
                        Change = legacy.ChangeGiven,
                        Currency = legacy.Currency ?? "KES"
                    },
                    Payments = new List<NormalizedPaymentInfo>
                    {
                        new NormalizedPaymentInfo { Method = legacy.PaymentMethod ?? "CASH", Amount = legacy.Total }
                    }
                }
            };

            if (legacy.Items != null)
            {
                foreach (var itm in legacy.Items)
                {
                    p.Document.Items.Add(new NormalizedPrintItem
                    {
                        Name = itm.Name ?? "Item",
                        Quantity = itm.Quantity,
                        Price = itm.Price,
                        Total = itm.Total,
                        Category = itm.Category
                    });
                }
            }

            return p;
        }
    }
}
