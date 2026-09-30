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
import site.salesmanpro.android.ui.screens.BluetoothScannerScreen
import site.salesmanpro.android.ui.screens.LoginScreen
import site.salesmanpro.android.ui.screens.MainWebViewScreen
import site.salesmanpro.android.ui.viewmodels.BluetoothViewModel
import site.salesmanpro.android.webbridge.WebAppInterface

class MainActivity : ComponentActivity() {
    private var deepLinkUri by mutableStateOf<Uri?>(null)
    private var filePickerCallback: ((Array<Uri>) -> Unit)? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

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

            // Validate existing session on launch
            LaunchedEffect(Unit) {
                currentSession?.let { session ->
                    val result = apiService.validateSession(session.token, session.company.id, session.activeStoreId)
                    result.onSuccess { refreshed ->
                        sessionManager.saveSession(refreshed)
                        currentSession = refreshed
                    }.onFailure {
                        // Session expired
                        sessionManager.clearSession()
                        currentSession = null
                    }
                    isCheckingSession = false
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
                // Authenticated Session -> Load POS WebView
                val session = currentSession!!
                val slug = session.company.slug?.ifEmpty { "admin" } ?: "admin"
                val storeId = session.activeStoreId
                val deviceId = session.device.deviceId

                val posUrl = "https://salesmanpro.site/admin/$slug/storepos?token=${session.token}&storeId=$storeId&deviceId=$deviceId&platform=ANDROID"

                Box(modifier = Modifier.fillMaxSize()) {
                    MainWebViewScreen(
                        url = posUrl,
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
                                    text = "${session.company.name} • ${session.activeStore?.name ?: "Main Store"}",
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "${session.user.name} (${session.user.role})",
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
                        BluetoothScannerScreen(
                            devices = bluetoothViewModel.pairedDevices,
                            onDeviceSelected = { device ->
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
        if (intent?.action == Intent.ACTION_VIEW) {
            deepLinkUri = intent.data
        }
    }
}
