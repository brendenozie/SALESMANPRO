using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace SalesmanProDesktop.Services
{
    public class SecurityService
    {
        private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("SalesmanPro-SecureDPAPI-Entropy-v1");

        public static void SaveSecureString(string relativeFilePath, string plainText)
        {
            try
            {
                var fullPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro", relativeFilePath);
                var dir = Path.GetDirectoryName(fullPath);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
                byte[] encryptedBytes = ProtectedData.Protect(plainBytes, Entropy, DataProtectionScope.CurrentUser);
                File.WriteAllBytes(fullPath, encryptedBytes);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[SecurityService] Save error: {ex.Message}");
            }
        }

        public static string? LoadSecureString(string relativeFilePath)
        {
            try
            {
                var fullPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro", relativeFilePath);
                if (!File.Exists(fullPath)) return null;

                byte[] encryptedBytes = File.ReadAllBytes(fullPath);
                byte[] decryptedBytes = ProtectedData.Unprotect(encryptedBytes, Entropy, DataProtectionScope.CurrentUser);
                return Encoding.UTF8.GetString(decryptedBytes);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[SecurityService] Load error: {ex.Message}");
                return null;
            }
        }

        public static void ClearSecureData(string relativeFilePath)
        {
            try
            {
                var fullPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SalesmanPro", relativeFilePath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }
            catch { }
        }
    }
}
