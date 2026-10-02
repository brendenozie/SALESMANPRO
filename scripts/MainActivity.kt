package site.salesmanpro.android

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.WebView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import site.salesmanpro.android.data.api.ApiService
import site.salesmanpro.android.data.models.AppSession
import site.salesmanpro.android.data.preferences.SessionManager
import site.salesmanpro.android.hardware.UnifiedPrinterManager
import site.salesmanpro.android.hardware.bluetooth.BluetoothPrinterService
import site.salesmanpro.android.ui.components.BluetoothScannerDialog
import site.salesmanpro.android.data.models.BluetoothDeviceItem
import site.salesmanpro.android.ui.screens.LoginScreen
import site.salesmanpro.android.ui.screens.MainWebViewScreen
import site.salesmanpro.android.ui.viewmodels.BluetoothViewModel
import site.salesmanpro.android.webbridge.WebAppInterface

class MainActivity : ComponentActivity() {
    private var deepLinkUri by mutableStateOf<Uri?>(null)
    private var filePickerCallback: ((Array<Uri>) -> Unit)? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIntent(intent)

        val sessionManager = SessionManager(this)
        val apiService = ApiService()
        val bluetoothPrinterService = BluetoothPrinterService(this)
        val unifiedPrinterManager = UnifiedPrinterManager(this, sessionManager, bluetoothPrinterService)
        val webAppInterface = WebAppInterface(unifiedPrinterManager)

        val bluetoothViewModel = BluetoothViewModel()

        WebView.setWebContentsDebuggingEnabled(false)

        setContent {
            var currentSession by remember { mutableStateOf<AppSession?>(sessionManager.getSession()) }
            var isCheckingSession by remember { mutableStateOf(currentSession != null) }
            var showScanner by remember { mutableStateOf(false) }

            val context = LocalContext.current
            val coroutineScope = rememberCoroutineScope()

            // Handle incoming deep link from Google OAuth or central handover
            LaunchedEffect(deepLinkUri) {
                val uri = deepLinkUri ?: return@LaunchedEffect
                if (uri.scheme == "salesmanpro" && uri.host == "callback") {
                    val token = uri.getQueryParameter("token")
                    val destination = uri.getQueryParameter("destination")
                    if (!token.isNullOrEmpty()) {
                        isCheckingSession = true
                        val exchangeResult = apiService.exchangeHandoverToken(token)
                        exchangeResult.onSuccess { session ->
                            val finalSession = if (!destination.isNullOrEmpty()) {
                                session.copy(destination = destination)
                            } else {
                                session
                            }
                            sessionManager.saveSession(finalSession)
                            currentSession = finalSession
                            Toast.makeText(context, "Welcome, ${finalSession.user.name}", Toast.LENGTH_SHORT).show()
                        }.onFailure { err ->
                            Toast.makeText(context, "Sign-in failed: ${err.message}", Toast.LENGTH_LONG).show()
                        }
                        isCheckingSession = false
                        deepLinkUri = null
                    }
                }
            }

            // Validate existing session on launch (only if not processing incoming deep link)
            LaunchedEffect(Unit) {
                if (deepLinkUri == null) {
                    currentSession?.let { session ->
                        val result = apiService.validateSession(session.token, session.company.id, session.activeStoreId)
                        result.onSuccess { refreshed ->
                            val merged = if (session.destination != null && refreshed.destination == null) {
                                refreshed.copy(destination = session.destination)
                            } else {
                                refreshed
                            }
                            sessionManager.saveSession(merged)
                            currentSession = merged
                        }.onFailure {
                            // Session expired
                            sessionManager.clearSession()
                            currentSession = null
                        }
                        isCheckingSession = false
                    }
                }
            }

            val permissionLauncher = rememberLauncherForActivityResult(
                ActivityResultContracts.RequestMultiplePermissions()
            ) { permissions ->
                val isConnectGranted = permissions[Manifest.permission.BLUETOOTH_CONNECT] == true
                if (isConnectGranted) {
                    bluetoothViewModel.fetchPairedDevices(context)
                    showScanner = true
                } else {
                    Toast.makeText(context, "Bluetooth permission denied", Toast.LENGTH_SHORT).show()
                }
            }

            val filePickerLauncher = rememberLauncherForActivityResult(
                ActivityResultContracts.OpenMultipleDocuments()
            ) { uris ->
                filePickerCallback?.invoke(uris.toTypedArray())
                filePickerCallback = null
            }

            if (isCheckingSession) {
                // Splash loading screen
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0xFF0F172A)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = Color(0xFF38BDF8))
                        Spacer(Modifier.height(16.dp))
                        Text("Connecting to SalesmanPro...", color = Color.White, fontSize = 14.sp)
                    }
                }
            } else if (currentSession == null) {
                // Native Direct Login
                LoginScreen(
                    sessionManager = sessionManager,
                    apiService = apiService,
                    onLoginSuccess = { session ->
                        currentSession = session
                    }
                )
            } else {
                // Authenticated Session -> Load Role-Specific Authorized Workspace
                val session = currentSession!!
                val slug = session.company.slug?.ifEmpty { "admin" } ?: "admin"
                val storeId = session.activeStoreId
                val deviceId = session.device.deviceId

                val roleDestination = session.destination?.ifEmpty { null }
                val targetPath = if (!roleDestination.isNullOrEmpty()) {
                    roleDestination
                } else if (session.user.role == "STAFF" || session.user.role == "CASHIER") {
                    "/admin/$slug/storepos?storeId=$storeId&deviceId=$deviceId"
                } else if (session.user.role == "SUPER_ADMIN") {
                    "/super-admin"
                } else if (session.user.role == "AGENT") {
                    "/agents"
                } else {
                    "/admin/$slug"
                }

                val fullUrl = if (targetPath.startsWith("http")) targetPath else "https://salesmanpro.site$targetPath"
                val separator = if (fullUrl.contains("?")) "&" else "?"
                val finalWebUrl = "$fullUrl${separator}token=${session.token}&platform=ANDROID"

                Box(modifier = Modifier.fillMaxSize()) {
                    MainWebViewScreen(
                        url = finalWebUrl,
                        webInterface = webAppInterface,
                        onPickFiles = { mimeTypes, callback ->
                            filePickerCallback = callback
                            filePickerLauncher.launch(mimeTypes)
                        }
                    )

                    // Context Top Bar
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xCC0F172A),
                        tonalElevation = 4.dp
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "${session.company.name} • ${session.user.name}",
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "${session.activeStore?.name ?: "All Stores"} (${session.user.role})",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 10.sp
                                )
                            }

                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                IconButton(
                                    onClick = {
                                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                                            permissionLauncher.launch(
                                                arrayOf(
                                                    Manifest.permission.BLUETOOTH_CONNECT,
                                                    Manifest.permission.BLUETOOTH_SCAN
                                                )
                                            )
                                        } else {
                                            bluetoothViewModel.fetchPairedDevices(context)
                                            showScanner = true
                                        }
                                    },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Settings,
                                        contentDescription = "Printer Settings",
                                        tint = Color(0xFF38BDF8)
                                    )
                                }

                                IconButton(
                                    onClick = {
                                        sessionManager.clearSession()
                                        currentSession = null
                                    },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ExitToApp,
                                        contentDescription = "Sign Out",
                                        tint = Color(0xFFEF4444)
                                    )
                                }
                            }
                        }
                    }

                    if (showScanner) {
                        BluetoothScannerDialog(
                            devices = bluetoothViewModel.pairedDevices,
                            onDeviceSelected = { device: BluetoothDeviceItem ->
                                sessionManager.savePrinterMac(device.address)
                                sessionManager.savePrinterType("BLUETOOTH")
                                showScanner = false
                                Toast.makeText(
                                    this@MainActivity,
                                    "Printer Linked: ${device.name}",
                                    Toast.LENGTH_SHORT
                                ).show()
                            },
                            onDismiss = { showScanner = false }
                        )
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        if (intent?.action == Intent.ACTION_VIEW && intent.data != null) {
            deepLinkUri = intent.data
        }
    }
}
