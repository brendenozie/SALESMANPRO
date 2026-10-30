package site.salesmanpro.android.data.models

import com.google.gson.annotations.SerializedName
import java.time.Instant

data class UserDto(
    @SerializedName("id") val id: String = "",
    @SerializedName("email") val email: String = "",
    @SerializedName("name") val name: String = "",
    @SerializedName("role") val role: String = "",
    @SerializedName("staffLoginCode") val staffLoginCode: String? = null
)

data class CompanyDto(
    @SerializedName("id") val id: String = "",
    @SerializedName("name") val name: String = "",
    @SerializedName("slug") val slug: String? = null
)

data class StoreDto(
    @SerializedName("id") val id: String = "",
    @SerializedName("name") val name: String = "",
    @SerializedName("code") val code: String? = null,
    @SerializedName("address") val address: String? = null,
    @SerializedName("isActive") val isActive: Boolean = true
)

data class DeviceContext(
    @SerializedName("deviceId") val deviceId: String = "",
    @SerializedName("deviceName") val deviceName: String = "",
    @SerializedName("platform") val platform: String = "ANDROID",
    @SerializedName("appVersion") val appVersion: String = "2.4.0",
    @SerializedName("protocolVersion") val protocolVersion: Int = 1
)

data class OfflineAuthGrantDto(
    @SerializedName("grantId") val grantId: String = "",
    @SerializedName("companyId") val companyId: String = "",
    @SerializedName("storeId") val storeId: String? = null,
    @SerializedName("deviceId") val deviceId: String = "",
    @SerializedName("userId") val userId: String = "",
    @SerializedName("role") val role: String = "",
    @SerializedName("issuedAt") val issuedAt: String = "",
    @SerializedName("expiresAt") val expiresAt: String = "",
    @SerializedName("signature") val signature: String = ""
)

data class StaffPinDigestDto(
    @SerializedName("userId") val userId: String = "",
    @SerializedName("name") val name: String = "",
    @SerializedName("role") val role: String = "CASHIER",
    @SerializedName("pinSha256") val pinSha256: String = ""
)

data class AppSession(
    @SerializedName("token") val token: String = "",
    @SerializedName("handoverToken") val handoverToken: String? = null,
    @SerializedName("destination") val destination: String? = null,
    @SerializedName("user") val user: UserDto = UserDto(),
    @SerializedName("company") val company: CompanyDto = CompanyDto(),
    @SerializedName("stores") val stores: List<StoreDto> = emptyList(),
    @SerializedName("activeStoreId") var activeStoreId: String = "",
    @SerializedName("device") val device: DeviceContext = DeviceContext(),
    @SerializedName("expiresAt") val expiresAt: String = "",
    @SerializedName("offlineGrant") val offlineGrant: OfflineAuthGrantDto? = null,
    @SerializedName("staffPinDigests") val staffPinDigests: List<StaffPinDigestDto> = emptyList()
) {
    val activeStore: StoreDto?
        get() = stores.find { it.id == activeStoreId } ?: stores.firstOrNull()

    fun isOfflineGrantValid(): Boolean {
        val expiryStr = offlineGrant?.expiresAt?.takeIf { it.isNotBlank() } ?: expiresAt
        if (expiryStr.isBlank()) {
            // Legacy session without explicit timestamp: allow offline access if token & companyId exist
            return token.isNotBlank() && company.id.isNotBlank()
        }
        return try {
            val expMillis = Instant.parse(expiryStr).toEpochMilli()
            System.currentTimeMillis() < expMillis
        } catch (e: Exception) {
            token.isNotBlank() && company.id.isNotBlank()
        }
    }
}
