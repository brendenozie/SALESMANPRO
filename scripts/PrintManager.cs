using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SalesmanProDesktop.Models;

namespace SalesmanProDesktop.Services
{
    public class PrintResult
    {
        public bool Success { get; set; }
        public string? JobId { get; set; }
        public string? PrinterName { get; set; }
        public string? ErrorMessage { get; set; }
        public bool IsDuplicate { get; set; }
    }

    public class PrintManager
    {
        private readonly PrinterService _printerService;
        private readonly PrinterProfileService _profileService;
        private readonly PrintQueueService _queueService;

        private static readonly ConcurrentDictionary<string, DateTime> _printedJobsCache = new ConcurrentDictionary<string, DateTime>();
        private static readonly ConcurrentDictionary<string, int> _reprintCounters = new ConcurrentDictionary<string, int>();

        public PrintManager(PrinterService printerService, PrinterProfileService profileService, PrintQueueService queueService)
        {
            _printerService = printerService;
            _profileService = profileService;
            _queueService = queueService;
        }

        public void Print(OrderData order)
        {
            if (order == null) return;
            var payload = NormalizedPrintPayload.FromLegacyOrder(order);
            _ = ProcessPrintJobAsync(payload);
        }

        public async Task<PrintResult> ProcessPrintJobAsync(NormalizedPrintPayload payload, bool forceReprint = false)
        {
            if (payload == null || payload.Document == null)
            {
                return new PrintResult { Success = false, ErrorMessage = "Invalid or empty print payload" };
            }

            var jobId = payload.JobId;

            // 1. DUPLICATE PRINT PROTECTION
            if (!forceReprint && !payload.IsReprint)
            {
                if (_printedJobsCache.TryGetValue(jobId, out var printedTime))
                {
                    System.Diagnostics.Debug.WriteLine($"[PrintManager] Suppressed duplicate print for job {jobId}. Originally printed at {printedTime}");
                    return new PrintResult
                    {
                        Success = true,
                        JobId = jobId,
                        IsDuplicate = true,
                        ErrorMessage = $"Duplicate print job {jobId} suppressed. Use 'Reprint' to print again."
                    };
                }
            }
            else
            {
                var count = _reprintCounters.AddOrUpdate(jobId, 1, (_, current) => current + 1);
                payload.IsReprint = true;
                payload.ReprintCount = count;
            }

            // 2. Resolve Printer by Priority Hierarchy
            var purpose = payload.DocumentType ?? "RECEIPT";
            var targetPrinter = _profileService.ResolvePrinter(purpose, payload.StoreId, payload.DeviceId);

            if (targetPrinter == null || !targetPrinter.IsConfigured)
            {
                _queueService.Enqueue(payload);
                _queueService.MarkStatus(jobId, PrintJobStatus.Failed, "No configured printer resolved for purpose: " + purpose);
                return new PrintResult
                {
                    Success = false,
                    JobId = jobId,
                    ErrorMessage = $"No configured printer found for purpose '{purpose}'. Please configure hardware settings."
                };
            }

            // 3. Persistent Queue tracking
            _queueService.Enqueue(payload);
            _queueService.MarkStatus(jobId, PrintJobStatus.Printing);

            // 4. Physical Print Execution
            var (success, error) = await _printerService.PrintPayloadAsync(payload, targetPrinter);

            if (success)
            {
                _printedJobsCache[jobId] = DateTime.UtcNow;
                _queueService.MarkStatus(jobId, PrintJobStatus.Printed);
                return new PrintResult
                {
                    Success = true,
                    JobId = jobId,
                    PrinterName = targetPrinter.Name
                };
            }
            else
            {
                _queueService.MarkStatus(jobId, PrintJobStatus.Failed, error);
                return new PrintResult
                {
                    Success = false,
                    JobId = jobId,
                    PrinterName = targetPrinter.Name,
                    ErrorMessage = error
                };
            }
        }
    }
}
