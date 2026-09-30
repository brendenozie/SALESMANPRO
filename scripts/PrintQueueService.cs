using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using SalesmanProDesktop.Models;

namespace SalesmanProDesktop.Services
{
    public enum PrintJobStatus
    {
        Queued,
        Printing,
        Printed,
        Failed,
        Cancelled
    }

    public class QueuedPrintJob
    {
        public string JobId { get; set; } = Guid.NewGuid().ToString("N");
        public string DocumentId { get; set; } = "";
        public string DocumentType { get; set; } = "RECEIPT";
        public string StoreId { get; set; } = "";
        public string DeviceId { get; set; } = "";
        public PrintJobStatus Status { get; set; } = PrintJobStatus.Queued;
        public int Attempts { get; set; } = 0;
        public string? Error { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PrintedAt { get; set; }
        public NormalizedPrintPayload Payload { get; set; } = new NormalizedPrintPayload();
        public OrderData? Order { get; set; }
    }

    public class PrintQueueService
    {
        private const string QUEUE_FILE = "print-queue.json";
        private readonly List<QueuedPrintJob> _queue = new List<QueuedPrintJob>();
        private readonly object _lock = new object();

        public PrintQueueService()
        {
            RecoverQueue();
        }

        public void Enqueue(NormalizedPrintPayload payload)
        {
            lock (_lock)
            {
                var job = new QueuedPrintJob
                {
                    JobId = payload.JobId,
                    DocumentId = payload.DocumentId,
                    DocumentType = payload.DocumentType,
                    StoreId = payload.StoreId,
                    DeviceId = payload.DeviceId ?? "",
                    Payload = payload,
                    Status = PrintJobStatus.Queued
                };

                _queue.Add(job);
                PersistQueue();
            }
        }

        public void MarkStatus(string jobId, PrintJobStatus status, string? error = null)
        {
            lock (_lock)
            {
                var job = _queue.FirstOrDefault(j => j.JobId == jobId);
                if (job != null)
                {
                    job.Status = status;
                    if (status == PrintJobStatus.Printed) job.PrintedAt = DateTime.UtcNow;
                    if (!string.IsNullOrEmpty(error)) job.Error = error;
                    job.Attempts++;
                    PersistQueue();
                }
            }
        }

        public List<QueuedPrintJob> Load()
        {
            lock (_lock)
            {
                return _queue.Where(j => j.Status == PrintJobStatus.Queued).ToList();
            }
        }

        public void Save(List<QueuedPrintJob> jobs)
        {
            PersistQueue();
        }

        public List<QueuedPrintJob> GetPendingJobs()
        {
            lock (_lock)
            {
                return _queue.Where(j => j.Status == PrintJobStatus.Queued || (j.Status == PrintJobStatus.Failed && j.Attempts < 3)).ToList();
            }
        }

        public List<QueuedPrintJob> GetAllJobs()
        {
            lock (_lock)
            {
                return _queue.OrderByDescending(j => j.CreatedAt).Take(50).ToList();
            }
        }

        private void PersistQueue()
        {
            try
            {
                var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro");
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

                var fullPath = Path.Combine(dir, QUEUE_FILE);
                var trimmed = _queue.OrderByDescending(j => j.CreatedAt).Take(100).ToList();
                var json = JsonSerializer.Serialize(trimmed);
                File.WriteAllText(fullPath, json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[PrintQueueService] Persist error: {ex.Message}");
            }
        }

        private void RecoverQueue()
        {
            try
            {
                var fullPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro", QUEUE_FILE);
                if (!File.Exists(fullPath)) return;

                var json = File.ReadAllText(fullPath);
                var list = JsonSerializer.Deserialize<List<QueuedPrintJob>>(json);
                if (list != null)
                {
                    lock (_lock)
                    {
                        _queue.Clear();
                        _queue.AddRange(list);
                        foreach (var j in _queue.Where(j => j.Status == PrintJobStatus.Printing))
                        {
                            j.Status = PrintJobStatus.Queued;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[PrintQueueService] Recovery error: {ex.Message}");
            }
        }
    }
}
