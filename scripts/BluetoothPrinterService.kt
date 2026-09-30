package site.salesmanpro.android.hardware.bluetooth

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import site.salesmanpro.android.webbridge.ReceiptDetails
import java.io.OutputStream
import java.util.UUID

class BluetoothPrinterService(private val context: Context) {

    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
    private val scope = CoroutineScope(Dispatchers.IO)

    private val ESC_INIT = byteArrayOf(0x1B, 0x40)
    private val ALIGN_LEFT = byteArrayOf(0x1B, 0x61, 0x00)
    private val ALIGN_CENTER = byteArrayOf(0x1B, 0x61, 0x01)
    private val BOLD_ON = byteArrayOf(0x1B, 0x45, 0x01)
    private val BOLD_OFF = byteArrayOf(0x1B, 0x45, 0x00)
    private val NEWLINE = byteArrayOf(0x0A)

    fun sendRawBytes(macAddress: String, data: ByteArray) {
        if (macAddress.isEmpty()) {
            Log.e("PrinterService", "No MAC address provided")
            return
        }

        scope.launch {
            connectAndSendRaw(macAddress, data)
        }
    }

    @SuppressLint("MissingPermission")
    private suspend fun connectAndSendRaw(macAddress: String, data: ByteArray) {
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        val adapter: BluetoothAdapter? = bluetoothManager.adapter

        if (adapter == null || !adapter.isEnabled) {
            Log.e("PrinterService", "Bluetooth is disabled or not supported")
            return
        }

        var socket: BluetoothSocket? = null
        try {
            val device = adapter.getRemoteDevice(macAddress)
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
            adapter.cancelDiscovery()
            socket.connect()

            val outputStream: OutputStream = socket.outputStream
            outputStream.write(data)
            outputStream.flush()
            Thread.sleep(500)
        } catch (e: Exception) {
            Log.e("PrinterService", "Failed to print raw bytes: ${e.message}")
        } finally {
            try {
                socket?.close()
            } catch (e: Exception) {
                Log.e("PrinterService", "Could not close socket: ${e.message}")
            }
        }
    }

    fun printReceipt(macAddress: String, receipt: ReceiptDetails) {
        if (macAddress.isEmpty()) {
            Log.e("PrinterService", "No MAC address provided")
            return
        }

        scope.launch {
            connectAndPrint(macAddress, receipt)
        }
    }

    @SuppressLint("MissingPermission")
    private suspend fun connectAndPrint(macAddress: String, receipt: ReceiptDetails) {
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        val adapter: BluetoothAdapter? = bluetoothManager.adapter

        if (adapter == null || !adapter.isEnabled) {
            Log.e("PrinterService", "Bluetooth is disabled or not supported")
            return
        }

        var socket: BluetoothSocket? = null
        try {
            val device = adapter.getRemoteDevice(macAddress)
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
            adapter.cancelDiscovery()
            socket.connect()

            val outputStream: OutputStream = socket.outputStream
            writeReceiptData(outputStream, receipt)
            Thread.sleep(1000)
        } catch (e: Exception) {
            Log.e("PrinterService", "Failed to print: ${e.message}")
        } finally {
            try {
                socket?.close()
            } catch (e: Exception) {
                Log.e("PrinterService", "Could not close socket: ${e.message}")
            }
        }
    }

    private fun writeReceiptData(out: OutputStream, receipt: ReceiptDetails) {
        out.write(ESC_INIT)

        out.write(ALIGN_CENTER)
        out.write(BOLD_ON)
        out.write("${receipt.BusinessName}\n".toByteArray())
        out.write(BOLD_OFF)
        out.write("${receipt.BusinessAddress}\n".toByteArray())
        out.write("Tel: ${receipt.PhoneNumber}\n".toByteArray())
        out.write("Tax ID: ${receipt.TaxId}\n".toByteArray())

        out.write("--------------------------------\n".toByteArray())
        out.write(ALIGN_LEFT)
        out.write("Invoice: ${receipt.InvoiceId}\n".toByteArray())
        out.write("Date:    ${receipt.Date}\n".toByteArray())
        out.write("Cashier: ${receipt.StaffName}\n".toByteArray())
        out.write("--------------------------------\n".toByteArray())

        out.write(BOLD_ON)
        out.write(formatLine("Item", "Total") + "\n")
        out.write(BOLD_OFF)
        out.write("--------------------------------\n".toByteArray())

        for (item in receipt.Items) {
            val nameLine = item.Name
            val qtyLine = "  ${item.Quantity} x ${String.format("%.2f", item.Price)}"
            val totalLine = String.format("%.2f", item.Total)
            out.write("$nameLine\n".toByteArray())
            out.write("${formatLine(qtyLine, totalLine)}\n".toByteArray())
        }

        out.write("--------------------------------\n".toByteArray())
        out.write(formatLine("Subtotal:", String.format("%.2f", receipt.Subtotal)) + "\n")
        out.write(formatLine("Tax (${receipt.TaxRate}%):", String.format("%.2f", receipt.TaxAmount)) + "\n")
        out.write(BOLD_ON)
        out.write(formatLine("TOTAL:", "${receipt.Currency} ${String.format("%.2f", receipt.TotalAmount)}") + "\n")
        out.write(BOLD_OFF)
        out.write(formatLine("Paid via ${receipt.PaymentMethod}:", String.format("%.2f", receipt.TotalAmount)) + "\n")

        if (receipt.ChangeGiven > 0) {
            out.write(formatLine("Change:", String.format("%.2f", receipt.ChangeGiven)) + "\n")
        }

        out.write("--------------------------------\n".toByteArray())
        out.write(ALIGN_CENTER)
        out.write("Thank you for your business!\n".toByteArray())

        val qrUrl = "https://verify.tax.gov/check?id=${receipt.InvoiceId}"
        out.write(getQrCodeBytes(qrUrl))

        out.write("\n\n\n\n".toByteArray())
        out.flush()
    }

    private fun formatLine(left: String, right: String): String {
        val maxLineLength = 32
        var safeLeft = left
        var safeRight = right

        if (safeLeft.length + safeRight.length > maxLineLength - 1) {
            safeLeft = safeLeft.substring(0, maxLineLength - safeRight.length - 2) + "."
        }

        val spaces = maxLineLength - safeLeft.length - safeRight.length
        val spaceStr = " ".repeat(Math.max(0, spaces))

        return "$safeLeft$spaceStr$safeRight"
    }

    private fun getQrCodeBytes(content: String): ByteArray {
        val bytes = mutableListOf<Byte>()
        bytes.addAll(listOf(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00).map { it.toByte() })
        val size = 0x06.toByte()
        bytes.addAll(listOf(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size).map { it.toByte() })
        bytes.addAll(listOf(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31).map { it.toByte() })
        val dataLen = content.length + 3
        val pL = (dataLen % 256).toByte()
        val pH = (dataLen / 256).toByte()
        bytes.addAll(listOf(0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30).map { it.toByte() })
        bytes.addAll(content.toByteArray().toList())
        bytes.addAll(listOf(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30).map { it.toByte() })
        return bytes.toByteArray()
    }
}
