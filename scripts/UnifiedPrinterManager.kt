package site.salesmanpro.android.hardware

import android.content.Context
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import site.salesmanpro.android.data.models.NormalizedPrintPayload
import site.salesmanpro.android.data.preferences.SessionManager
import site.salesmanpro.android.hardware.bluetooth.BluetoothPrinterService
import java.io.ByteArrayOutputStream
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.ConcurrentHashMap

data class PrintExecutionResult(
    val success: Boolean,
    val isDuplicate: Boolean = false,
    val errorMessage: String? = null
)

class UnifiedPrinterManager(
    private val context: Context,
    private val sessionManager: SessionManager,
    private val bluetoothService: BluetoothPrinterService
) {
    // In-memory cache for duplicate print protection
    private val printedJobsCache = ConcurrentHashMap<String, Long>()
    private val reprintCounters = ConcurrentHashMap<String, Int>()

    suspend fun processPrintPayload(payload: NormalizedPrintPayload, forceReprint: Boolean = false): PrintExecutionResult {
        val jobId = payload.jobId

        // 1. DUPLICATE PRINT PROTECTION
        if (!forceReprint && !payload.isReprint) {
            val lastPrinted = printedJobsCache[jobId]
            if (lastPrinted != null) {
                return PrintExecutionResult(
                    success = true,
                    isDuplicate = true,
                    errorMessage = "Duplicate print job $jobId suppressed. Use explicit Reprint if needed."
                )
            }
        } else {
            val count = (reprintCounters[jobId] ?: 0) + 1
            reprintCounters[jobId] = count
            payload.isReprint = true
            payload.reprintCount = count
        }

        val printerType = sessionManager.getPrinterType()

        val success = when (printerType.uppercase()) {
            "BLUETOOTH" -> {
                val mac = sessionManager.getPrinterMac()
                if (mac.isEmpty()) {
                    return PrintExecutionResult(success = false, errorMessage = "No Bluetooth printer configured. Please select a printer in settings.")
                }
                printViaBluetooth(mac, payload)
            }
            "NETWORK" -> {
                val ip = sessionManager.getPrinterMac() // Stores IP:Port for network
                if (ip.isEmpty()) {
                    return PrintExecutionResult(success = false, errorMessage = "No Network printer IP configured.")
                }
                printViaNetwork(ip, payload)
            }
            "SYSTEM", "A4" -> {
                printViaAndroidSystem(payload)
                true
            }
            else -> {
                val mac = sessionManager.getPrinterMac()
                if (mac.isNotEmpty()) {
                    printViaBluetooth(mac, payload)
                } else {
                    return PrintExecutionResult(success = false, errorMessage = "No printer configured.")
                }
            }
        }

        if (success) {
            printedJobsCache[jobId] = System.currentTimeMillis()
            return PrintExecutionResult(success = true)
        } else {
            return PrintExecutionResult(success = false, errorMessage = "Failed to communicate with printer.")
        }
    }

    private fun printViaBluetooth(macAddress: String, payload: NormalizedPrintPayload): Boolean {
        return try {
            val rawEscPos = buildEscPosReceipt(payload, 32)
            bluetoothService.sendRawBytes(macAddress, rawEscPos)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private suspend fun printViaNetwork(ipAddress: String, payload: NormalizedPrintPayload): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val parts = ipAddress.split(":")
                val host = parts[0]
                val port = if (parts.size > 1) parts[1].toIntOrNull() ?: 9100 else 9100

                Socket().use { socket ->
                    socket.connect(InetSocketAddress(host, port), 4000)
                    val rawBytes = buildEscPosReceipt(payload, 48)
                    socket.getOutputStream().write(rawBytes)
                    socket.getOutputStream().flush()
                }
                true
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }
    }

    private fun printViaAndroidSystem(payload: NormalizedPrintPayload) {
        val printManager = context.getSystemService(Context.PRINT_SERVICE) as? PrintManager ?: return
        val jobName = "SalesmanPro_${payload.document.number}"

        val htmlContent = generateHtmlReceipt(payload)
        val webView = WebView(context)
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                val printAdapter = view.createPrintDocumentAdapter(jobName)
                printManager.print(jobName, printAdapter, PrintAttributes.Builder().build())
            }
        }
        webView.loadDataWithBaseURL(null, htmlContent, "text/html", "UTF-8", null)
    }

    companion object {
        val ESC_INIT = byteArrayOf(0x1B, 0x40)
        val ESC_ALIGN_LEFT = byteArrayOf(0x1B, 0x61, 0x00)
        val ESC_ALIGN_CENTER = byteArrayOf(0x1B, 0x61, 0x01)
        val ESC_ALIGN_RIGHT = byteArrayOf(0x1B, 0x61, 0x02)
        val ESC_BOLD_ON = byteArrayOf(0x1B, 0x45, 0x01)
        val ESC_BOLD_OFF = byteArrayOf(0x1B, 0x45, 0x00)
        val ESC_DOUBLE_ON = byteArrayOf(0x1D, 0x21, 0x11)
        val ESC_DOUBLE_OFF = byteArrayOf(0x1D, 0x21, 0x00)
        val ESC_FEED_AND_CUT = byteArrayOf(0x1D, 0x56, 0x41, 0x03)
        val ESC_OPEN_DRAWER = byteArrayOf(0x1B, 0x70, 0x00, 0x19, 0xFA.toByte())

        fun buildEscPosReceipt(payload: NormalizedPrintPayload, lineWidth: Int): ByteArray {
            val bos = ByteArrayOutputStream()
            bos.write(ESC_INIT)

            if (payload.documentType.equals("RECEIPT", ignoreCase = true)) {
                bos.write(ESC_OPEN_DRAWER)
            }

            val doc = payload.document

            // Center header
            bos.write(ESC_ALIGN_CENTER)
            bos.write(ESC_BOLD_ON)
            bos.write(ESC_DOUBLE_ON)
            bos.write(((doc.orderType ?: "SALESMANPRO").uppercase() + "\n").toByteArray(Charsets.US_ASCII))
            bos.write(ESC_DOUBLE_OFF)
            bos.write(ESC_BOLD_OFF)

            if (payload.isReprint) {
                bos.write(ESC_BOLD_ON)
                bos.write("*** REPRINT #${payload.reprintCount} ***\n".toByteArray(Charsets.US_ASCII))
                bos.write(ESC_BOLD_OFF)
            }

            val divider = "-".repeat(lineWidth) + "\n"
            bos.write(divider.toByteArray(Charsets.US_ASCII))

            // Left metadata
            bos.write(ESC_ALIGN_LEFT)
            bos.write("Doc #: ${doc.number}\n".toByteArray(Charsets.US_ASCII))
            bos.write("Date : ${doc.date}\n".toByteArray(Charsets.US_ASCII))
            doc.cashierName?.let { bos.write("Staff: $it\n".toByteArray(Charsets.US_ASCII)) }
            doc.customer?.name?.let { bos.write("Cust : $it\n".toByteArray(Charsets.US_ASCII)) }
            doc.table?.let { bos.write("Table: $it\n".toByteArray(Charsets.US_ASCII)) }

            bos.write(divider.toByteArray(Charsets.US_ASCII))

            // Items - Server Authoritative
            bos.write(ESC_BOLD_ON)
            bos.write(formatLine("ITEM", "QTY  TOTAL", lineWidth).toByteArray(Charsets.US_ASCII))
            bos.write("\n".toByteArray(Charsets.US_ASCII))
            bos.write(ESC_BOLD_OFF)
            bos.write(divider.toByteArray(Charsets.US_ASCII))

            for (item in doc.items) {
                bos.write((item.name + "\n").toByteArray(Charsets.US_ASCII))
                val qtyStr = if (item.quantity % 1.0 == 0.0) item.quantity.toInt().toString() else String.format("%.2f", item.quantity)
                val line2 = "  ${qtyStr}x @${String.format("%.2f", item.price)}"
                val line2Right = String.format("%.2f", item.total)
                bos.write(formatLine(line2, line2Right, lineWidth).toByteArray(Charsets.US_ASCII))
                bos.write("\n".toByteArray(Charsets.US_ASCII))
                item.notes?.let { bos.write("  * $it\n".toByteArray(Charsets.US_ASCII)) }
            }

            bos.write(divider.toByteArray(Charsets.US_ASCII))

            // Totals (Authoritative from server, no client recalculation)
            val totals = doc.totals
            bos.write(formatLine("SUBTOTAL:", "${totals.currency} ${String.format("%.2f", totals.subtotal)}", lineWidth).toByteArray(Charsets.US_ASCII))
            bos.write("\n".toByteArray(Charsets.US_ASCII))

            if (totals.discount > 0) {
                bos.write(formatLine("DISCOUNT:", "-${String.format("%.2f", totals.discount)}", lineWidth).toByteArray(Charsets.US_ASCII))
                bos.write("\n".toByteArray(Charsets.US_ASCII))
            }

            if (totals.tax > 0) {
                bos.write(formatLine("TAX (${totals.taxRate}%):", String.format("%.2f", totals.tax), lineWidth).toByteArray(Charsets.US_ASCII))
                bos.write("\n".toByteArray(Charsets.US_ASCII))
            }

            if (totals.deliveryFee > 0) {
                bos.write(formatLine("DELIVERY FEE:", String.format("%.2f", totals.deliveryFee), lineWidth).toByteArray(Charsets.US_ASCII))
                bos.write("\n".toByteArray(Charsets.US_ASCII))
            }

            bos.write(ESC_BOLD_ON)
            bos.write(formatLine("TOTAL:", "${totals.currency} ${String.format("%.2f", totals.total)}", lineWidth).toByteArray(Charsets.US_ASCII))
            bos.write("\n".toByteArray(Charsets.US_ASCII))
            bos.write(ESC_BOLD_OFF)

            bos.write(divider.toByteArray(Charsets.US_ASCII))

            if (doc.payments.isNotEmpty()) {
                for (pay in doc.payments) {
                    bos.write(formatLine("PAID (${pay.method}):", "${totals.currency} ${String.format("%.2f", pay.amount)}", lineWidth).toByteArray(Charsets.US_ASCII))
                    bos.write("\n".toByteArray(Charsets.US_ASCII))
                }
            } else if (totals.paid > 0) {
                bos.write(formatLine("PAID:", "${totals.currency} ${String.format("%.2f", totals.paid)}", lineWidth).toByteArray(Charsets.US_ASCII))
                bos.write("\n".toByteArray(Charsets.US_ASCII))
            }

            if (totals.change > 0) {
                bos.write(formatLine("CHANGE:", "${totals.currency} ${String.format("%.2f", totals.change)}", lineWidth).toByteArray(Charsets.US_ASCII))
                bos.write("\n".toByteArray(Charsets.US_ASCII))
            }

            bos.write(divider.toByteArray(Charsets.US_ASCII))

            // eTIMS Fiscal Details (KRA Compliance)
            val fiscal = doc.fiscalDetails
            if (fiscal != null && fiscal.taxpayerPin.isNotEmpty()) {
                bos.write(ESC_ALIGN_CENTER)
                bos.write(ESC_BOLD_ON)
                bos.write("** KRA eTIMS FISCAL RECEIPT **\n".toByteArray(Charsets.US_ASCII))
                bos.write(ESC_BOLD_OFF)
                bos.write(ESC_ALIGN_LEFT)
                bos.write("KRA PIN : ${fiscal.taxpayerPin}\n".toByteArray(Charsets.US_ASCII))
                if (!fiscal.branchId.isNullOrEmpty()) {
                    val bName = fiscal.branchName ?: "Head Office"
                    bos.write("Branch  : $bName (${fiscal.branchId})\n".toByteArray(Charsets.US_ASCII))
                }
                if (!fiscal.deviceId.isNullOrEmpty()) {
                    bos.write("SCU ID  : ${fiscal.deviceId}\n".toByteArray(Charsets.US_ASCII))
                }
                if (!fiscal.controlCode.isNullOrEmpty()) {
                    bos.write("Ctrl No : ${fiscal.controlCode}\n".toByteArray(Charsets.US_ASCII))
                }
                if (!fiscal.internalData.isNullOrEmpty()) {
                    bos.write("Sign    : ${fiscal.internalData}\n".toByteArray(Charsets.US_ASCII))
                }
                bos.write(divider.toByteArray(Charsets.US_ASCII))
            }

            // QR Code (eTIMS Verification / Receipt)
            val qrUrl = fiscal?.qrCodeUrl ?: doc.qrCodeUrl
            if (!qrUrl.isNullOrEmpty()) {
                bos.write(ESC_ALIGN_CENTER)
                bos.write("Scan to Verify with KRA:\n".toByteArray(Charsets.US_ASCII))
                bos.write(getQrCodeBytes(qrUrl))
                bos.write("\n".toByteArray(Charsets.US_ASCII))
                bos.write(divider.toByteArray(Charsets.US_ASCII))
            }

            // Footer
            bos.write(ESC_ALIGN_CENTER)
            bos.write(((doc.footer ?: "Thank you for your business!") + "\n\n").toByteArray(Charsets.US_ASCII))
            bos.write("Powered by SalesmanPro\n\n\n".toByteArray(Charsets.US_ASCII))

            bos.write(ESC_FEED_AND_CUT)
            return bos.toByteArray()
        }

        fun getQrCodeBytes(content: String): ByteArray {
            val bytes = mutableListOf<Byte>()
            // Select model (Model 2)
            bytes.addAll(listOf(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00).map { it.toByte() })
            // Set module size (5 dots)
            val size = 0x05.toByte()
            bytes.addAll(listOf(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size).map { it.toByte() })
            // Error correction level (Level M)
            bytes.addAll(listOf(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31).map { it.toByte() })
            // Store data
            val dataBytes = content.toByteArray(Charsets.UTF_8)
            val dataLen = dataBytes.size + 3
            val pL = (dataLen % 256).toByte()
            val pH = (dataLen / 256).toByte()
            bytes.addAll(listOf(0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30).map { it.toByte() })
            bytes.addAll(dataBytes.toList())
            // Print symbol
            bytes.addAll(listOf(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30).map { it.toByte() })
            return bytes.toByteArray()
        }

        private fun formatLine(left: String, right: String, width: Int): String {
            val spaceCount = width - left.length - right.length
            val spaces = if (spaceCount > 0) " ".repeat(spaceCount) else " "
            return left + spaces + right
        }

        private fun generateHtmlReceipt(payload: NormalizedPrintPayload): String {
            val doc = payload.document
            val sb = StringBuilder()
            sb.append("<html><body style='font-family:monospace;padding:16px;'>")
            sb.append("<h2 style='text-align:center;'>${doc.orderType ?: "SALESMANPRO"}</h2>")
            if (payload.isReprint) sb.append("<h3 style='color:red;text-align:center;'>*** REPRINT #${payload.reprintCount} ***</h3>")
            sb.append("<hr/><p>Receipt: ${doc.number}<br/>Date: ${doc.date}</p><hr/>")
            sb.append("<table style='width:100%;'>")
            for (i in doc.items) {
                sb.append("<tr><td>${i.name}</td><td>${i.quantity}x</td><td style='text-align:right;'>${String.format("%.2f", i.total)}</td></tr>")
            }
            sb.append("</table><hr/>")
            sb.append("<p style='text-align:right;'><b>TOTAL: ${doc.totals.currency} ${String.format("%.2f", doc.totals.total)}</b></p>")

            val fiscal = doc.fiscalDetails
            if (fiscal != null && fiscal.taxpayerPin.isNotEmpty()) {
                sb.append("<hr/>")
                sb.append("<div style='text-align:center;font-weight:bold;'>** KRA eTIMS FISCAL RECEIPT **</div>")
                sb.append("<div>KRA PIN: ${fiscal.taxpayerPin}</div>")
                if (!fiscal.branchId.isNullOrEmpty()) {
                    sb.append("<div>Branch: ${fiscal.branchName ?: "Head Office"} (${fiscal.branchId})</div>")
                }
                if (!fiscal.deviceId.isNullOrEmpty()) {
                    sb.append("<div>SCU ID: ${fiscal.deviceId}</div>")
                }
                if (!fiscal.controlCode.isNullOrEmpty()) {
                    sb.append("<div>Control No: ${fiscal.controlCode}</div>")
                }
                if (!fiscal.internalData.isNullOrEmpty()) {
                    sb.append("<div style='word-break:break-all;'>Signature: ${fiscal.internalData}</div>")
                }
            }

            val qrUrl = fiscal?.qrCodeUrl ?: doc.qrCodeUrl
            if (!qrUrl.isNullOrEmpty()) {
                sb.append("<hr/>")
                sb.append("<div style='text-align:center;'>")
                sb.append("<div>Scan to Verify with KRA:</div>")
                try {
                    val encoded = java.net.URLEncoder.encode(qrUrl, "UTF-8")
                    sb.append("<img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}' style='width:120px;height:120px;margin-top:8px;' /><br/>")
                } catch (e: Exception) {
                    // Fallback
                }
                sb.append("<div style='font-size:10px;word-break:break-all;margin-top:4px;'>${qrUrl}</div>")
                sb.append("</div>")
            }

            sb.append("<p style='text-align:center;margin-top:16px;'>${doc.footer ?: "Thank you!"}</p>")
            sb.append("</body></html>")
            return sb.toString()
        }
    }
}
