package site.salesmanpro.android.data.api

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import site.salesmanpro.android.data.models.AppSession
import site.salesmanpro.android.data.models.UserDto
import site.salesmanpro.android.data.models.CompanyDto
import com.google.gson.Gson
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class ApiService(private val baseUrl: String = "https://salesmanpro.site") {
    private val gson = Gson()

    suspend fun loginWithCredentials(email: String, password: String, deviceId: String, deviceName: String): Result<AppSession> {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL("$baseUrl/api/auth/app-login")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 10000
                conn.readTimeout = 10000

                val payload = JSONObject().apply {
                    put("email", email.trim())
                    put("password", password)
                    put("deviceId", deviceId)
                    put("deviceName", deviceName)
                    put("platform", "ANDROID")
                    put("appVersion", "2.4.0")
                    put("protocolVersion", 1)
                }

                OutputStreamWriter(conn.outputStream).use { it.write(payload.toString()) }

                val responseCode = conn.responseCode
                val stream = if (responseCode in 200..299) conn.inputStream else conn.errorStream
                val responseText = BufferedReader(InputStreamReader(stream)).use { it.readText() }

                if (responseCode in 200..299) {
                    val session = gson.fromJson(responseText, AppSession::class.java)
                    Result.success(session)
                } else {
                    val errMsg = try {
                        JSONObject(responseText).optString("error", "Login failed (HTTP $responseCode)")
                    } catch (e: Exception) {
                        "Login failed (HTTP $responseCode)"
                    }
                    Result.failure(Exception(errMsg))
                }
            } catch (e: Exception) {
                Result.failure(Exception("Unable to connect to server: ${e.message}"))
            }
        }
    }

    suspend fun loginWithStaffPin(staffPin: String, deviceId: String, deviceName: String): Result<AppSession> {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL("$baseUrl/api/auth/app-login")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 10000
                conn.readTimeout = 10000

                val payload = JSONObject().apply {
                    put("staffLoginCode", staffPin.trim())
                    put("deviceId", deviceId)
                    put("deviceName", deviceName)
                    put("platform", "ANDROID")
                    put("appVersion", "2.4.0")
                    put("protocolVersion", 1)
                }

                OutputStreamWriter(conn.outputStream).use { it.write(payload.toString()) }

                val responseCode = conn.responseCode
                val stream = if (responseCode in 200..299) conn.inputStream else conn.errorStream
                val responseText = BufferedReader(InputStreamReader(stream)).use { it.readText() }

                if (responseCode in 200..299) {
                    val session = gson.fromJson(responseText, AppSession::class.java)
                    Result.success(session)
                } else {
                    val errMsg = try {
                        JSONObject(responseText).optString("error", "Invalid staff PIN (HTTP $responseCode)")
                    } catch (e: Exception) {
                        "Invalid staff PIN (HTTP $responseCode)"
                    }
                    Result.failure(Exception(errMsg))
                }
            } catch (e: Exception) {
                Result.failure(Exception("Unable to connect to server: ${e.message}"))
            }
        }
    }

    suspend fun exchangeHandoverToken(handoverToken: String): Result<AppSession> {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL("$baseUrl/api/auth/handover")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 10000
                conn.readTimeout = 10000

                val payload = JSONObject().apply {
                    put("token", handoverToken)
                    put("platform", "ANDROID")
                }

                OutputStreamWriter(conn.outputStream).use { it.write(payload.toString()) }

                val responseCode = conn.responseCode
                val stream = if (responseCode in 200..299) conn.inputStream else conn.errorStream
                val responseText = BufferedReader(InputStreamReader(stream)).use { it.readText() }

                if (responseCode in 200..299) {
                    val json = JSONObject(responseText)
                    val sessionToken = json.getString("token")
                    val userObj = json.getJSONObject("user")
                    val destination = json.optString("destination", "/dashboards")

                    val user = UserDto(
                        id = userObj.optString("id"),
                        email = userObj.optString("email"),
                        name = userObj.optString("name"),
                        role = userObj.optString("role")
                    )
                    val companyId = userObj.optString("companyId", "")
                    val companyObj = json.optJSONObject("company")
                    val company = if (companyObj != null) {
                        CompanyDto(
                            id = companyObj.optString("id", companyId),
                            name = companyObj.optString("name", "SalesmanPro"),
                            slug = if (companyObj.has("slug") && !companyObj.isNull("slug")) companyObj.getString("slug") else null
                        )
                    } else {
                        CompanyDto(id = companyId, name = "SalesmanPro")
                    }

                    val activeStoreId = json.optString("activeStoreId", "")

                    val session = AppSession(
                        token = sessionToken,
                        handoverToken = handoverToken,
                        destination = destination,
                        user = user,
                        company = company,
                        activeStoreId = activeStoreId
                    )
                    Result.success(session)
                } else {
                    val errMsg = try {
                        val json = JSONObject(responseText)
                        val m = json.optString("message", json.optString("error", ""))
                        if (m.isNotEmpty()) m else "Handover exchange failed (HTTP $responseCode)"
                    } catch (e: Exception) {
                        "Handover exchange failed (HTTP $responseCode)"
                    }
                    Result.failure(Exception(errMsg))
                }
            } catch (e: Exception) {
                Result.failure(Exception("Unable to exchange handover token: ${e.message}"))
            }
        }
    }

    suspend fun validateSession(token: String, companyId: String, storeId: String): Result<AppSession> {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL("$baseUrl/api/auth/app-login")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "GET"
                conn.setRequestProperty("Authorization", "Bearer $token")
                conn.setRequestProperty("x-company-id", companyId)
                conn.setRequestProperty("x-store-id", storeId)
                conn.connectTimeout = 8000
                conn.readTimeout = 8000

                val responseCode = conn.responseCode
                if (responseCode in 200..299) {
                    val responseText = BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
                    val session = gson.fromJson(responseText, AppSession::class.java)
                    Result.success(session)
                } else {
                    Result.failure(Exception("Session expired (HTTP $responseCode)"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}
