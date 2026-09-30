package site.salesmanpro.android.data.preferences

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import com.google.gson.Gson
import site.salesmanpro.android.data.models.AppSession
import java.util.UUID

class SessionManager(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("SalesmanProSession", Context.MODE_PRIVATE)
    private val gson = Gson()

    fun saveSession(session: AppSession) {
        val json = gson.toJson(session)
        prefs.edit().putString(KEY_SESSION, json).apply()
    }

    fun getSession(): AppSession? {
        val json = prefs.getString(KEY_SESSION, null) ?: return null
        return try {
            gson.fromJson(json, AppSession::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun clearSession() {
        prefs.edit().remove(KEY_SESSION).apply()
    }

    fun getOrCreateDeviceId(): String {
        var id = prefs.getString(KEY_DEVICE_ID, null)
        if (id.isNullOrEmpty()) {
            val model = Build.MODEL.replace(" ", "_")
            id = "AND_${model}_${UUID.randomUUID().toString().substring(0, 8).uppercase()}"
            prefs.edit().putString(KEY_DEVICE_ID, id).apply()
        }
        return id
    }

    fun getPrinterMac(): String {
        return prefs.getString(KEY_PRINTER_MAC, "") ?: ""
    }

    fun savePrinterMac(mac: String) {
        prefs.edit().putString(KEY_PRINTER_MAC, mac).apply()
    }

    fun getPrinterType(): String {
        return prefs.getString(KEY_PRINTER_TYPE, "BLUETOOTH") ?: "BLUETOOTH"
    }

    fun savePrinterType(type: String) {
        prefs.edit().putString(KEY_PRINTER_TYPE, type).apply()
    }

    companion object {
        private const val KEY_SESSION = "app_session"
        private const val KEY_DEVICE_ID = "device_id"
        private const val KEY_PRINTER_MAC = "printer_mac"
        private const val KEY_PRINTER_TYPE = "printer_type"
    }
}
