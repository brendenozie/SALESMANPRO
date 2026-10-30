using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using SalesmanProDesktop.Models;

namespace SalesmanProDesktop.Services
{
    public class AuthService
    {
        private static readonly HttpClient _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
        private const string SESSION_CACHE_FILE = "auth.dat";
        private const string DEVICE_ID_FILE = "device.id";

        public AppSession? CurrentSession { get; private set; }

        public event Action<AppSession?>? SessionChanged;

        public string BaseUrl { get; set; } = "https://salesmanpro.store";

        public string GetOrCreateDeviceId()
        {
            try
            {
                var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro");
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

                var filePath = Path.Combine(dir, DEVICE_ID_FILE);
                if (File.Exists(filePath))
                {
                    var id = File.ReadAllText(filePath).Trim();
                    if (!string.IsNullOrEmpty(id)) return id;
                }

                var newId = "WPF_" + Guid.NewGuid().ToString("N").Substring(0, 12).ToUpper();
                File.WriteAllText(filePath, newId);
                return newId;
            }
            catch
            {
                return "WPF_FALLBACK_" + Environment.MachineName;
            }
        }

        public async Task<(bool success, string message, AppSession? session)> LoginAsync(string email, string password)
        {
            return await ExecuteLoginRequest(new
            {
                email = email.Trim(),
                password = password,
                deviceId = GetOrCreateDeviceId(),
                deviceName = Environment.MachineName,
                platform = "WPF",
                appVersion = "2.4.0",
                protocolVersion = 1
            });
        }

        public async Task<(bool success, string message, AppSession? session)> StaffLoginAsync(string staffLoginCode)
        {
            var cleanPin = staffLoginCode.Trim();
            var onlineResult = await ExecuteLoginRequest(new
            {
                staffLoginCode = cleanPin,
                deviceId = GetOrCreateDeviceId(),
                deviceName = Environment.MachineName,
                platform = "WPF",
                appVersion = "2.4.0",
                protocolVersion = 1
            });

            if (onlineResult.success)
            {
                return onlineResult;
            }

            // If network is unreachable, attempt offline Staff PIN verification against cached digests
            if (onlineResult.message.Contains("Unable to reach", StringComparison.OrdinalIgnoreCase) ||
                onlineResult.message.Contains("timed out", StringComparison.OrdinalIgnoreCase))
            {
                var offlineSession = VerifyOfflineStaffPin(cleanPin);
                if (offlineSession != null)
                {
                    CurrentSession = offlineSession;
                    PersistSession(offlineSession);
                    SessionChanged?.Invoke(CurrentSession);
                    return (true, "Authenticated offline via cached store grant", offlineSession);
                }
            }

            return onlineResult;
        }

        public AppSession? VerifyOfflineStaffPin(string staffPin)
        {
            var cached = CurrentSession ?? RestorePersistedSession();
            if (cached == null || !cached.IsOfflineGrantValid()) return null;

            var cleanPin = staffPin.Trim();
            if (string.IsNullOrEmpty(cleanPin)) return null;

            if (!string.IsNullOrEmpty(cached.User?.StaffLoginCode) && cached.User.StaffLoginCode == cleanPin)
            {
                return cached;
            }

            var digestHex = ComputeSha256Hex($"{cached.Company.Id}:{cleanPin}");
            var matched = cached.StaffPinDigests?.FirstOrDefault(d =>
                string.Equals(d.PinSha256, digestHex, StringComparison.OrdinalIgnoreCase));

            if (matched != null)
            {
                cached.User = new UserDto
                {
                    Id = matched.UserId,
                    Name = matched.Name,
                    Role = matched.Role,
                    Email = cached.User?.Email ?? "",
                    StaffLoginCode = cleanPin
                };
                return cached;
            }

            return null;
        }

        private static string ComputeSha256Hex(string input)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
            var sb = new StringBuilder(bytes.Length * 2);
            foreach (var b in bytes)
            {
                sb.Append(b.ToString("x2"));
            }
            return sb.ToString();
        }

        private async Task<(bool success, string message, AppSession? session)> ExecuteLoginRequest(object requestBody)
        {
            try
            {
                var url = $"{BaseUrl.TrimEnd('/')}/api/auth/app-login";
                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(url, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(responseBody);
                        var err = doc.RootElement.TryGetProperty("error", out var e) ? e.GetString() : "Invalid credentials";
                        return (false, err ?? "Login failed. Please check your credentials.", null);
                    }
                    catch
                    {
                        return (false, $"Login failed: HTTP {(int)response.StatusCode}", null);
                    }
                }

                var session = JsonSerializer.Deserialize<AppSession>(responseBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (session == null || string.IsNullOrEmpty(session.Token))
                {
                    return (false, "Malformed response from server.", null);
                }

                if (session.ExpiresAt <= DateTime.MinValue.AddYears(1))
                {
                    session.ExpiresAt = DateTime.UtcNow.AddDays(30);
                }

                CurrentSession = session;
                PersistSession(session);
                SessionChanged?.Invoke(CurrentSession);

                return (true, "Authenticated successfully", session);
            }
            catch (HttpRequestException ex)
            {
                return (false, $"Unable to reach SalesmanPro server. Please check your network connection: {ex.Message}", null);
            }
            catch (TaskCanceledException)
            {
                return (false, "Connection timed out. Server did not respond in time.", null);
            }
            catch (Exception ex)
            {
                return (false, $"An unexpected login error occurred: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Validates the current session against the cloud when online, but preserves
        /// the encrypted local session (auth.dat) when offline if the offline grant has not expired.
        /// Only calls Logout() on definitive HTTP 401/403 (expired token or revoked device).
        /// </summary>
        public async Task<bool> ValidateCurrentSessionAsync()
        {
            if (CurrentSession == null || string.IsNullOrEmpty(CurrentSession.Token))
            {
                CurrentSession = RestorePersistedSession();
            }

            if (CurrentSession == null || string.IsNullOrEmpty(CurrentSession.Token))
            {
                return false;
            }

            try
            {
                var url = $"{BaseUrl.TrimEnd('/')}/api/auth/app-login";
                using var req = new HttpRequestMessage(HttpMethod.Get, url);
                req.Headers.Add("Authorization", $"Bearer {CurrentSession.Token}");
                req.Headers.Add("x-company-id", CurrentSession.Company?.Id ?? "");
                req.Headers.Add("x-store-id", CurrentSession.ActiveStoreId ?? "");
                req.Headers.Add("x-device-id", CurrentSession.Device?.DeviceId ?? GetOrCreateDeviceId());

                var res = await _httpClient.SendAsync(req);
                if (res.IsSuccessStatusCode)
                {
                    var body = await res.Content.ReadAsStringAsync();
                    var refreshed = JsonSerializer.Deserialize<AppSession>(body, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    if (refreshed != null && !string.IsNullOrEmpty(refreshed.Token))
                    {
                        if (refreshed.ExpiresAt <= DateTime.MinValue.AddYears(1))
                        {
                            refreshed.ExpiresAt = DateTime.UtcNow.AddDays(30);
                        }
                        CurrentSession = refreshed;
                        PersistSession(refreshed);
                    }
                    SessionChanged?.Invoke(CurrentSession);
                    return true;
                }

                // Definitive revocation or token expiration from server -> clear session
                if (res.StatusCode == HttpStatusCode.Unauthorized || res.StatusCode == HttpStatusCode.Forbidden)
                {
                    System.Diagnostics.Debug.WriteLine($"[AuthService] Server rejected session ({(int)res.StatusCode}). Logging out.");
                    Logout();
                    return false;
                }

                // Transient server error (5xx): fall back to local offline grant check
                if (CurrentSession.IsOfflineGrantValid())
                {
                    SessionChanged?.Invoke(CurrentSession);
                    return true;
                }
            }
            catch (Exception ex)
            {
                // Offline / Network unreachable: DO NOT delete auth.dat if offline grant is valid!
                System.Diagnostics.Debug.WriteLine($"[AuthService] Offline startup detected ({ex.Message}). Checking offline grant...");
                if (CurrentSession != null && CurrentSession.IsOfflineGrantValid())
                {
                    SessionChanged?.Invoke(CurrentSession);
                    return true;
                }
            }

            Logout();
            return false;
        }

        public void Logout()
        {
            CurrentSession = null;
            SecurityService.ClearSecureData(SESSION_CACHE_FILE);
            SessionChanged?.Invoke(null);
        }

        private void PersistSession(AppSession session)
        {
            try
            {
                var json = JsonSerializer.Serialize(session);
                SecurityService.SaveSecureString(SESSION_CACHE_FILE, json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[AuthService] Persist error: {ex.Message}");
            }
        }

        public AppSession? RestorePersistedSession()
        {
            try
            {
                var json = SecurityService.LoadSecureString(SESSION_CACHE_FILE);
                if (string.IsNullOrEmpty(json)) return null;

                var session = JsonSerializer.Deserialize<AppSession>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (session != null && session.IsOfflineGrantValid())
                {
                    if (session.ExpiresAt <= DateTime.MinValue.AddYears(1))
                    {
                        session.ExpiresAt = DateTime.UtcNow.AddDays(30);
                    }
                    CurrentSession = session;
                    return session;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[AuthService] Restore error: {ex.Message}");
            }
            return null;
        }

        public void SetActiveStore(string storeId)
        {
            if (CurrentSession != null)
            {
                CurrentSession.ActiveStoreId = storeId;
                PersistSession(CurrentSession);
                SessionChanged?.Invoke(CurrentSession);
            }
        }
    }
}
