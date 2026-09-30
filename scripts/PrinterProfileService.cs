using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using SalesmanProDesktop.Models;

namespace SalesmanProDesktop.Services
{
    public class PrinterProfileService
    {
        private const string PROFILES_FILE = "printer-profiles.json";
        private readonly List<PrinterConnection> _profiles = new List<PrinterConnection>();

        public PrinterProfileService()
        {
            LoadProfiles();
        }

        public IReadOnlyList<PrinterConnection> GetAllProfiles() => _profiles.AsReadOnly();

        public PrinterConnection? ResolvePrinter(string purpose, string? storeId = null, string? deviceId = null)
        {
            purpose = purpose.ToUpperInvariant();

            // 1. Device + Store + Purpose
            if (!string.IsNullOrEmpty(deviceId) && !string.IsNullOrEmpty(storeId))
            {
                var match = _profiles.FirstOrDefault(p =>
                    p.Purpose.Equals(purpose, StringComparison.OrdinalIgnoreCase) &&
                    p.StoreId == storeId &&
                    p.DeviceId == deviceId &&
                    p.IsConfigured);
                if (match != null) return match;
            }

            // 2. Store + Purpose
            if (!string.IsNullOrEmpty(storeId))
            {
                var match = _profiles.FirstOrDefault(p =>
                    p.Purpose.Equals(purpose, StringComparison.OrdinalIgnoreCase) &&
                    p.StoreId == storeId &&
                    p.IsConfigured);
                if (match != null) return match;
            }

            // 3. Purpose match (any store/device)
            var purposeMatch = _profiles.FirstOrDefault(p =>
                p.Purpose.Equals(purpose, StringComparison.OrdinalIgnoreCase) &&
                p.IsConfigured);
            if (purposeMatch != null) return purposeMatch;

            // 4. Default configured printer
            var def = _profiles.FirstOrDefault(p => p.IsDefault && p.IsConfigured);
            if (def != null) return def;

            // 5. Any configured printer
            return _profiles.FirstOrDefault(p => p.IsConfigured);
        }

        public void SaveProfile(PrinterConnection profile)
        {
            var idx = _profiles.FindIndex(p => p.Id == profile.Id);
            if (idx >= 0)
            {
                _profiles[idx] = profile;
            }
            else
            {
                _profiles.Add(profile);
            }

            if (profile.IsDefault)
            {
                foreach (var p in _profiles.Where(p => p.Id != profile.Id))
                {
                    p.IsDefault = false;
                }
            }

            Persist();
        }

        public void DeleteProfile(string profileId)
        {
            _profiles.RemoveAll(p => p.Id == profileId);
            Persist();
        }

        private void Persist()
        {
            try
            {
                var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro");
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

                var fullPath = Path.Combine(dir, PROFILES_FILE);
                var json = JsonSerializer.Serialize(_profiles, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(fullPath, json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[PrinterProfileService] Persist error: {ex.Message}");
            }
        }

        private void LoadProfiles()
        {
            try
            {
                var fullPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro", PROFILES_FILE);
                if (!File.Exists(fullPath)) return;

                var json = File.ReadAllText(fullPath);
                var list = JsonSerializer.Deserialize<List<PrinterConnection>>(json);
                if (list != null)
                {
                    _profiles.Clear();
                    _profiles.AddRange(list);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[PrinterProfileService] Load error: {ex.Message}");
            }
        }
    }
}
