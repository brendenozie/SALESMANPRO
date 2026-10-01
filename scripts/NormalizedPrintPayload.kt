package site.salesmanpro.android.data.models

import com.google.gson.annotations.SerializedName

data class NormalizedPrintTotals(
    @SerializedName("subtotal") val subtotal: Double = 0.0,
    @SerializedName("discount") val discount: Double = 0.0,
    @SerializedName("tax") val tax: Double = 0.0,
    @SerializedName("taxRate") val taxRate: Double = 0.0,
    @SerializedName("deliveryFee") val deliveryFee: Double = 0.0,
    @SerializedName("total") val total: Double = 0.0,
    @SerializedName("paid") val paid: Double = 0.0,
    @SerializedName("balance") val balance: Double = 0.0,
    @SerializedName("change") val change: Double = 0.0,
    @SerializedName("currency") val currency: String = "KES"
)

data class NormalizedPrintItem(
    @SerializedName("id") val id: String? = null,
    @SerializedName("name") val name: String = "",
    @SerializedName("sku") val sku: String? = null,
    @SerializedName("quantity") val quantity: Double = 1.0,
    @SerializedName("price") val price: Double = 0.0,
    @SerializedName("discount") val discount: Double = 0.0,
    @SerializedName("total") val total: Double = 0.0,
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("category") val category: String? = null
)

data class NormalizedCustomer(
    @SerializedName("name") val name: String? = null,
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("address") val address: String? = null
)

data class NormalizedPaymentInfo(
    @SerializedName("method") val method: String = "CASH",
    @SerializedName("amount") val amount: Double = 0.0,
    @SerializedName("reference") val reference: String? = null
)

data class NormalizedFiscalDetails(
    @SerializedName("taxpayerPin") val taxpayerPin: String = "",
    @SerializedName("branchId") val branchId: String? = null,
    @SerializedName("branchName") val branchName: String? = null,
    @SerializedName("deviceId") val deviceId: String? = null,
    @SerializedName("controlCode") val controlCode: String? = null,
    @SerializedName("internalData") val internalData: String? = null,
    @SerializedName("receiptNumber") val receiptNumber: String? = null,
    @SerializedName("qrCodeUrl") val qrCodeUrl: String? = null,
    @SerializedName("invoiceType") val invoiceType: String? = null
)

data class NormalizedDocument(
    @SerializedName("number") val number: String = "",
    @SerializedName("date") val date: String = "",
    @SerializedName("customer") val customer: NormalizedCustomer? = null,
    @SerializedName("cashierName") val cashierName: String? = null,
    @SerializedName("staffCode") val staffCode: String? = null,
    @SerializedName("orderType") val orderType: String? = null,
    @SerializedName("table") val table: String? = null,
    @SerializedName("items") val items: List<NormalizedPrintItem> = emptyList(),
    @SerializedName("totals") val totals: NormalizedPrintTotals = NormalizedPrintTotals(),
    @SerializedName("payments") val payments: List<NormalizedPaymentInfo> = emptyList(),
    @SerializedName("fiscalDetails") val fiscalDetails: NormalizedFiscalDetails? = null,
    @SerializedName("qrCodeUrl") val qrCodeUrl: String? = null,
    @SerializedName("footer") val footer: String? = null
)

data class NormalizedPrintPayload(
    @SerializedName("protocolVersion") val protocolVersion: Int = 1,
    @SerializedName("jobId") val jobId: String = "",
    @SerializedName("documentType") val documentType: String = "RECEIPT",
    @SerializedName("documentId") val documentId: String = "",
    @SerializedName("companyId") val companyId: String = "",
    @SerializedName("storeId") val storeId: String = "",
    @SerializedName("deviceId") val deviceId: String? = null,
    @SerializedName("createdAt") val createdAt: String = "",
    @SerializedName("isReprint") var isReprint: Boolean = false,
    @SerializedName("reprintCount") var reprintCount: Int = 0,
    @SerializedName("document") val document: NormalizedDocument = NormalizedDocument()
)
