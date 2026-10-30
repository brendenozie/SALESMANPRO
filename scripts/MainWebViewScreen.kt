package site.salesmanpro.android.ui.screens

import android.net.*
import android.net.http.SslError
import android.os.Build
import android.webkit.*
import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.delay
import kotlin.math.pow
import site.salesmanpro.android.webbridge.WebAppInterface
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.compose.ui.platform.LocalLifecycleOwner

/* ---------------- Shadow ---------------- */
fun Modifier.neoShadow(
    color: Color = Color.Black,
    offsetX: Dp = 4.dp,
    offsetY: Dp = 4.dp
) = drawBehind {
    drawRoundRect(
        color = color,
        topLeft = Offset(offsetX.toPx(), offsetY.toPx()),
        size = size,
        cornerRadius = CornerRadius(0f, 0f)
    )
}

/* ---------------- Network Observer ---------------- */
@Composable
fun rememberNetworkState(): State<Boolean> {
    val context = LocalContext.current
    val cm = context.getSystemService(ConnectivityManager::class.java)
    val initialConnected = remember {
        val activeNet = cm?.activeNetwork
        val caps = activeNet?.let { cm.getNetworkCapabilities(it) }
        caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
    }
    val connected = remember { mutableStateOf(initialConnected) }

    DisposableEffect(Unit) {
        val cb = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                connected.value = true
            }
            override fun onLost(network: Network) {
                connected.value = false
            }
        }
        cm?.registerNetworkCallback(
            NetworkRequest.Builder()
                .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                .build(),
            cb
        )
        onDispose { cm?.unregisterNetworkCallback(cb) }
    }
    return connected
}

/* ---------------- Auto Retry ---------------- */
suspend fun autoRetry(
    maxAttempts: Int = 5,
    baseDelayMs: Long = 1000,
    block: suspend () -> Boolean
) {
    repeat(maxAttempts) { attempt ->
        if (block()) return
        delay(baseDelayMs * 2.0.pow(attempt).toLong())
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainWebViewScreen(
    url: String? = null,
    directFallbackUrl: String? = null,
    webInterface: WebAppInterface,
    modifier: Modifier = Modifier,
    onPickFiles: (
        mimeTypes: Array<String>,
        callback: (Array<Uri>) -> Unit
    ) -> Unit
) {
    val context = LocalContext.current
    var webView: WebView? by remember { mutableStateOf(null) }

    val isOnline by rememberNetworkState()

    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isRefreshing by remember { mutableStateOf(false) }
    var canGoBack by remember { mutableStateOf(false) }
    val webVisible by remember { mutableStateOf(true) }

    var isLoading by remember { mutableStateOf(true) }
    var loadProgress by remember { mutableIntStateOf(0) }

    val pullState = rememberPullToRefreshState()

    val baseUrl = "https://salesmanpro.store"
    val entryUrl = url ?: "$baseUrl/dashboards"
    val offlineSafeUrl = directFallbackUrl ?: entryUrl

    val defaultUA = WebSettings.getDefaultUserAgent(context)
    val appUA = defaultUA.replace("; wv", "") + " SalesmanProAndroid"

    val lifecycleOwner = LocalLifecycleOwner.current

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_PAUSE) {
                CookieManager.getInstance().flush()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    BackHandler { if (canGoBack) webView?.goBack() }

    /* -------- Dynamic WebView Cache Mode & Offline Handling -------- */
    LaunchedEffect(isOnline) {
        webView?.settings?.cacheMode = if (isOnline) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        if (!isOnline) {
            // Do NOT set a full-screen blocking errorMessage when offline!
            // Allow the local-first POS workspace in WebView + Service Worker to remain interactive.
            isLoading = false
        } else if (errorMessage != null) {
            autoRetry {
                webView?.loadUrl(entryUrl)
                delay(1200)
                errorMessage == null
            }
        }
    }

    Column(modifier.fillMaxSize()) {
        /* -------- Non-Blocking Offline Mode Banner -------- */
        AnimatedVisibility(visible = !isOnline) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFD97706))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(
                    Icons.Default.Warning,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    text = "OFFLINE MODE • Local sales & receipts active. Auto-syncs when online.",
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {

            /* -------- WebView -------- */
            androidx.compose.animation.AnimatedVisibility(
                visible = webVisible,
                modifier = Modifier.fillMaxSize(),
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                PullToRefreshBox(
                    isRefreshing = isRefreshing,
                    onRefresh = {
                        if (isOnline) {
                            isRefreshing = true
                            webView?.reload()
                        } else {
                            isRefreshing = false
                        }
                    },
                    state = pullState,
                    modifier = Modifier.fillMaxSize()
                ) {
                    AndroidView(
                        modifier = Modifier.fillMaxSize(),
                        factory = { ctx ->
                            WebView(ctx).apply {

                                layoutParams = android.view.ViewGroup.LayoutParams(
                                    android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                                    android.view.ViewGroup.LayoutParams.MATCH_PARENT
                                )

                                settings.apply {
                                    javaScriptEnabled = true
                                    domStorageEnabled = true
                                    databaseEnabled = true
                                    allowFileAccess = true
                                    allowContentAccess = true
                                    cacheMode = if (isOnline) WebSettings.LOAD_DEFAULT else WebSettings.LOAD_CACHE_ELSE_NETWORK
                                    userAgentString = appUA
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                        safeBrowsingEnabled = false
                                    }
                                }

                                val cookieManager = CookieManager.getInstance()
                                cookieManager.setAcceptCookie(true)
                                cookieManager.setAcceptThirdPartyCookies(this, true)
                                CookieManager.getInstance().flush()

                                webChromeClient = object : WebChromeClient() {
                                    override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                        loadProgress = newProgress
                                        if (newProgress >= 90) isLoading = false
                                    }
                                    override fun onShowFileChooser(
                                        webView: WebView?,
                                        filePathCallback: ValueCallback<Array<Uri>>?,
                                        fileChooserParams: FileChooserParams?
                                    ): Boolean {

                                        val mimeTypes = fileChooserParams
                                            ?.acceptTypes
                                            ?.filter { it.isNotBlank() }
                                            ?.toTypedArray()
                                            ?: arrayOf("*/*")

                                        onPickFiles(mimeTypes) { uris ->
                                            filePathCallback?.onReceiveValue(uris)
                                        }

                                        return true
                                    }

                                    override fun onPermissionRequest(request: PermissionRequest?) {
                                        // Grant camera & media permissions requested by the web app (e.g. camera barcode scanning, photo uploads)
                                        request?.grant(request.resources)
                                    }
                                }

                                webViewClient = object : WebViewClient() {
                                    private var hasError = false
                                    private var justCompletedAuth = false
                                    private var triedOfflineFallback = false

                                    override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                                        super.onPageStarted(view, url, favicon)
                                        hasError = false

                                        val safeUrl = url ?: ""
                                        val cleanUrl = safeUrl.substringBefore("?").removeSuffix("/")
                                        val cleanBase = baseUrl.removeSuffix("/")

                                        if (cleanUrl.contains("/api/auth/callback/")) {
                                            justCompletedAuth = true
                                        } else if (justCompletedAuth) {
                                            justCompletedAuth = false
                                            val isOriginalScreen = cleanUrl == cleanBase || cleanUrl.endsWith("/login") || cleanUrl.endsWith("/signin")
                                            val hasAuthError = safeUrl.contains("error=")

                                            if (isOriginalScreen && !hasAuthError) {
                                                view?.stopLoading()
                                                view?.loadUrl(entryUrl)
                                                return
                                            }
                                        }

                                        CookieManager.getInstance().flush()
                                    }

                                    override fun shouldOverrideUrlLoading(
                                        view: WebView,
                                        request: WebResourceRequest
                                    ): Boolean {
                                        val reqUrl = request.url.toString()
                                        if (reqUrl.contains("salesmanpro.store") || reqUrl.contains("salesmanpro.site")) {
                                            CookieManager.getInstance().flush()
                                        }
                                        return false
                                    }

                                    override fun doUpdateVisitedHistory(view: WebView?, url: String?, isReload: Boolean) {
                                        super.doUpdateVisitedHistory(view, url, isReload)
                                        CookieManager.getInstance().flush()
                                    }

                                    override fun onPageFinished(view: WebView, url: String) {
                                        if (!hasError) {
                                            canGoBack = view.canGoBack()
                                            isRefreshing = false
                                            errorMessage = null

                                            val cm = CookieManager.getInstance()
                                            cm.flush()

                                            val cleanUrl = url.substringBefore("?").removeSuffix("/")
                                            val cleanBase = baseUrl.removeSuffix("/")
                                            val isOriginalScreen = cleanUrl == cleanBase || cleanUrl.endsWith("/login") || cleanUrl.endsWith("/signin")

                                            if (isOriginalScreen && isOnline) {
                                                val allCookies = (cm.getCookie(url) ?: "") + " ; " + (cm.getCookie(baseUrl) ?: "")
                                                val hasSession = allCookies.contains("next-auth.session-token")
                                                if (hasSession) {
                                                    view.loadUrl(entryUrl)
                                                }
                                            }
                                        } else {
                                            isLoading = false
                                            isRefreshing = false
                                        }
                                    }

                                    override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                                        if (request?.isForMainFrame == true) {
                                            val failingUrl = request.url?.toString().orEmpty()
                                            // If starting offline and the /api/auth/handover endpoint failed, switch to cached target URL directly
                                            if (!isOnline && !triedOfflineFallback && failingUrl.contains("/api/auth/handover")) {
                                                triedOfflineFallback = true
                                                view?.settings?.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
                                                view?.loadUrl(offlineSafeUrl)
                                                return
                                            }

                                            // Only block the screen if online or if even the cached fallback is unavailable
                                            if (isOnline) {
                                                hasError = true
                                                errorMessage = "Check your connection and try again."
                                            }
                                            isRefreshing = false
                                            isLoading = false
                                        }
                                    }

                                    override fun onReceivedHttpError(view: WebView?, request: WebResourceRequest?, errorResponse: WebResourceResponse?) {
                                        if (request?.isForMainFrame == true && isOnline) {
                                            val statusCode = errorResponse?.statusCode ?: 0
                                            if (statusCode >= 500) {
                                                hasError = true
                                                errorMessage = "Server unavailable. Please retry."
                                                isRefreshing = false
                                                isLoading = false
                                            }
                                        }
                                    }

                                    override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                                        hasError = true
                                        errorMessage = "Secure connection failed."
                                        isRefreshing = false
                                        isLoading = false
                                        handler?.cancel()
                                    }
                                }

                                addJavascriptInterface(
                                    webInterface,
                                    "AndroidBridge"
                                )
                                webInterface.webViewGetter = { this }

                                post {
                                    // If launching offline, load the cached target workspace directly instead of /api/auth/handover
                                    val initialTarget = if (isOnline) entryUrl else offlineSafeUrl
                                    loadUrl(initialTarget)
                                }

                                webView = this
                            }
                        }
                    )
                }
            }

            /* -------- Error Overlay (Only shown for unrecoverable errors) -------- */
            androidx.compose.animation.AnimatedVisibility(
                visible = errorMessage != null,
                modifier = Modifier.fillMaxSize(),
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                ConnectionErrorView(
                    message = errorMessage ?: "",
                    onRetry = {
                        errorMessage = null
                        isLoading = true
                        loadProgress = 0
                        webView?.settings?.cacheMode = if (isOnline) WebSettings.LOAD_DEFAULT else WebSettings.LOAD_CACHE_ELSE_NETWORK
                        webView?.loadUrl(if (isOnline) entryUrl else offlineSafeUrl)
                    }
                )
            }

            /* -------- High-Impact Initial Splash -------- */
            androidx.compose.animation.AnimatedVisibility(
                visible = isLoading && loadProgress < 25 && errorMessage == null,
                modifier = Modifier.fillMaxSize(),
                exit = fadeOut()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "SALESMANPRO",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp
                        ),
                        modifier = Modifier
                            .border(3.dp, Color.Black)
                            .padding(16.dp)
                            .neoShadow()
                            .background(Color(0xFFF4FF5E))
                    )
                }
            }
        }
    }
}

/* ---------------- Error UI ---------------- */

@Composable
fun ConnectionErrorView(
    message: String,
    onRetry: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFF6B6B))
            .padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Box(
            modifier = Modifier
                .neoShadow()
                .background(Color.White)
                .border(3.dp, Color.Black)
                .padding(24.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.Warning,
                    contentDescription = null,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(Modifier.height(16.dp))
                Text(
                    "CONNECTION LOST",
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp
                )
                Text(message, textAlign = TextAlign.Center)
            }
        }

        Spacer(Modifier.height(24.dp))

        Button(
            onClick = onRetry,
            shape = RectangleShape,
            colors = ButtonDefaults.buttonColors(containerColor = Color.Black),
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .neoShadow(color = Color.White)
        ) {
            Text("RETRY", color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}
