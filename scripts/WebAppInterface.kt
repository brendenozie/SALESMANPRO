package site.salesmanpro.android.webbridge

import android.util.Log
import android.webkit.JavascriptInterface
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import site.salesmanpro.android.data.models.NormalizedCustomer
import site.salesmanpro.android.data.models.NormalizedDocument
import site.salesmanpro.android.data.models.NormalizedPaymentInfo
import site.salesmanpro.android.data.models.NormalizedPrintItem
import site.salesmanpro.android.data.models.NormalizedPrintPayload
import site.salesmanpro.android.data.models.NormalizedPrintTotals
import site.salesmanpro.android.hardware.UnifiedPrinterManager
import java.util.UUID

class WebAppInterface(
    private val printerManager: UnifiedPrinterManager
) {
    private val gson = Gson()
    private val scope = CoroutineScope(Dispatchers.Main)

    @JavascriptInterface
    fun postMessage(json: String) {
        try {
            Log.d("WebAppInterface", "Received postMessage: $json")
            val root = gson.fromJson(json, Map::class.java)
            val msgType = root["type"] as? String

            if (msgType == "PRINT_PAYLOAD" || msgType == "PRINT_ESC_POS" || msgType == "PRINT_HTML_RECEIPT") {
                val payloadObj = root["payload"]
                val payloadJson = gson.toJson(payloadObj)

                val payload: NormalizedPrintPayload? = if (payloadJson.contains("\"protocolVersion\":1")) {
                    gson.fromJson(payloadJson, NormalizedPrintPayload::class.java)
                } else {
                    // Adapt legacy receipt structure to NormalizedPrintPayload
                    val legacy = gson.fromJson(payloadJson, ReceiptDetails::class.java)
                    convertLegacyReceipt(legacy)
                }

                if (payload != null) {
                    scope.launch {
                        val result = printerManager.processPrintPayload(payload)
                        if (!result.success && !result.isDuplicate) {
                            Log.e("WebAppInterface", "Print execution failed: ${result.errorMessage}")
                        }
                    }
                }
            } else if (msgType == "SHOW_NOTIFICATION" || msgType == "NOTIFICATION_RECEIVED") {
                val payloadObj = root["payload"] as? Map<*, *>
                val title = payloadObj?.get("title") as? String ?: "SalesmanPro Alert"
                val message = payloadObj?.get("message") as? String ?: ""
                Log.d("WebAppInterface", "Displaying native Android notification: $title - $message")
            }
        } catch (e: Exception) {
            Log.e("WebAppInterface", "Error parsing postMessage: ${e.message}", e)
        }
    }

    @JavascriptInterface
    fun getPushToken(): String {
        return ""
    }

    private fun convertLegacyReceipt(legacy: ReceiptDetails): NormalizedPrintPayload {
        val doc = NormalizedDocument(
            number = legacy.InvoiceId.ifEmpty { "INV-${UUID.randomUUID().toString().substring(0, 8)}" },
            date = legacy.Date,
            cashierName = legacy.StaffName,
            orderType = legacy.BusinessName,
            items = legacy.Items.map {
                NormalizedPrintItem(
                    name = it.Name,
                    quantity = it.Quantity.toDouble(),
                    price = it.Price,
                    discount = it.Discount,
                    total = it.Total
                )
            },
            totals = NormalizedPrintTotals(
                subtotal = legacy.Subtotal,
                tax = legacy.TaxAmount,
                taxRate = legacy.TaxRate,
                total = legacy.TotalAmount,
                paid = legacy.TotalAmount,
                change = legacy.ChangeGiven,
                currency = legacy.Currency.ifEmpty { "KES" }
            ),
            payments = listOf(
                NormalizedPaymentInfo(
                    method = legacy.PaymentMethod,
                    amount = legacy.TotalAmount
                )
            )
        )

        return NormalizedPrintPayload(
            jobId = "legacy_${legacy.InvoiceId.ifEmpty { UUID.randomUUID().toString() }}",
            documentType = "RECEIPT",
            documentId = legacy.InvoiceId,
            document = doc
        )
    }
}

data class ReceiptPayload(
    val type: String,
    val payload: ReceiptDetails
)

data class ReceiptDetails(
    val BusinessName: String = "",
    val BusinessAddress: String = "",
    val TaxId: String = "",
    val PhoneNumber: String = "",
    val InvoiceId: String = "",
    val StaffName: String = "",
    val Date: String = "",
    val Items: List<ReceiptItem> = emptyList(),
    val Currency: String = "KES",
    val TaxRate: Double = 0.0,
    val TaxAmount: Double = 0.0,
    val Subtotal: Double = 0.0,
    val TotalAmount: Double = 0.0,
    val ChangeGiven: Double = 0.0,
    val PaymentMethod: String = "CASH"
)

data class ReceiptItem(
    val Name: String = "",
    val Quantity: Int = 1,
    val Price: Double = 0.0,
    val Discount: Double = 0.0,
    val Total: Double = 0.0
)
