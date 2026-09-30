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

    public class AppSession
    {
        public string Token { get; set; } = "";
        public string? HandoverToken { get; set; }
        public UserDto User { get; set; } = new UserDto();
        public CompanyDto Company { get; set; } = new CompanyDto();
        public List<StoreDto> Stores { get; set; } = new List<StoreDto>();
        public string ActiveStoreId { get; set; } = "";
        public DeviceContext Device { get; set; } = new DeviceContext();
        public DateTime ExpiresAt { get; set; }

        public StoreDto? ActiveStore => Stores.Find(s => s.Id == ActiveStoreId) ?? Stores.FirstOrDefault();
    }
}
