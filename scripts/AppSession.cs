using System;
using System.Collections.Generic;
using System.Linq;

namespace SalesmanProDesktop.Models
{
    public class UserDto
    {
        public string Id { get; set; } = "";
        public string Email { get; set; } = "";
        public string Name { get; set; } = "";
        public string Role { get; set; } = "";
        public string? StaffLoginCode { get; set; }
    }

    public class CompanyDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Slug { get; set; }
    }

    public class StoreDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Code { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class DeviceContext
    {
        public string DeviceId { get; set; } = "";
        public string DeviceName { get; set; } = "";
        public string Platform { get; set; } = "WPF";
        public string AppVersion { get; set; } = "2.4.0";
        public int ProtocolVersion { get; set; } = 1;
    }

    public class OfflineAuthGrantDto
    {
        public string GrantId { get; set; } = "";
        public string CompanyId { get; set; } = "";
        public string? StoreId { get; set; }
        public string DeviceId { get; set; } = "";
        public string UserId { get; set; } = "";
        public string Role { get; set; } = "";
        public string IssuedAt { get; set; } = "";
        public string ExpiresAt { get; set; } = "";
        public string Signature { get; set; } = "";
    }

    public class StaffPinDigestDto
    {
        public string UserId { get; set; } = "";
        public string Name { get; set; } = "";
        public string Role { get; set; } = "CASHIER";
        public string PinSha256 { get; set; } = "";
    }

    public class AppSession
    {
        public string Token { get; set; } = "";
        public string? HandoverToken { get; set; }
        public UserDto User { get; set; } = new UserDto();
        public CompanyDto Company { get; set; } = new CompanyDto();
        public List<StoreDto> Stores { get; set; } = new List<StoreDto>();
        public string ActiveStoreId { get; set; } = "";
        public DeviceContext Device { get; set; } = new DeviceContext();
        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(30);
        public OfflineAuthGrantDto? OfflineGrant { get; set; }
        public List<StaffPinDigestDto> StaffPinDigests { get; set; } = new List<StaffPinDigestDto>();

        public StoreDto? ActiveStore => Stores.Find(s => s.Id == ActiveStoreId) ?? Stores.FirstOrDefault();

        public bool IsOfflineGrantValid()
        {
            if (string.IsNullOrEmpty(Token) || string.IsNullOrEmpty(Company?.Id))
            {
                return false;
            }

            if (OfflineGrant != null && !string.IsNullOrEmpty(OfflineGrant.ExpiresAt))
            {
                if (DateTime.TryParse(OfflineGrant.ExpiresAt, null, System.Globalization.DateTimeStyles.RoundtripKind, out var grantExp))
                {
                    return grantExp.ToUniversalTime() > DateTime.UtcNow;
                }
            }

            if (ExpiresAt <= DateTime.MinValue.AddYears(1))
            {
                // Legacy session before explicit ExpiresAt field was returned
                return true;
            }

            return ExpiresAt.ToUniversalTime() > DateTime.UtcNow;
        }
    }
}
