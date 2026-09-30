package site.salesmanpro.android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import site.salesmanpro.android.data.api.ApiService
import site.salesmanpro.android.data.models.AppSession
import site.salesmanpro.android.data.preferences.SessionManager

@Composable
fun LoginScreen(
    sessionManager: SessionManager,
    apiService: ApiService,
    onLoginSuccess: (AppSession) -> Unit
) {
    var isStaffPinTab by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var staffPin by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val coroutineScope = rememberCoroutineScope()
    val deviceId = remember { sessionManager.getOrCreateDeviceId() }
    val deviceName = remember { android.os.Build.MODEL }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Text(
                    text = "SALESMANPRO",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF38BDF8),
                    letterSpacing = 1.5.sp
                )
                Text(
                    text = "Point of Sale • Android Edition",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8),
                    modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                )

                // Tab Switcher
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { isStaffPinTab = false; errorMessage = null },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (!isStaffPinTab) Color(0xFF2563EB) else Color(0xFF334155)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Account", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = { isStaffPinTab = true; errorMessage = null },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isStaffPinTab) Color(0xFF2563EB) else Color(0xFF334155)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Staff PIN", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }

                // Error Message Banner
                errorMessage?.let { msg ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0x33EF4444), RoundedCornerShape(8.dp))
                            .border(1.dp, Color(0xFFEF4444), RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Text(
                            text = msg,
                            color = Color(0xFFFCA5A5),
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    Spacer(Modifier.height(16.dp))
                }

                // Forms
                if (!isStaffPinTab) {
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email Address") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF38BDF8),
                            unfocusedBorderColor = Color(0xFF475569)
                        )
                    )

                    Spacer(Modifier.height(12.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF38BDF8),
                            unfocusedBorderColor = Color(0xFF475569)
                        )
                    )
                } else {
                    OutlinedTextField(
                        value = staffPin,
                        onValueChange = { staffPin = it },
                        label = { Text("Staff POS Code / PIN") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF38BDF8),
                            unfocusedBorderColor = Color(0xFF475569)
                        )
                    )
                }

                Spacer(Modifier.height(24.dp))

                // Submit Button
                Button(
                    onClick = {
                        errorMessage = null
                        isLoading = true
                        coroutineScope.launch {
                            val result = if (!isStaffPinTab) {
                                apiService.loginWithCredentials(email, password, deviceId, deviceName)
                            } else {
                                apiService.loginWithStaffPin(staffPin, deviceId, deviceName)
                            }

                            isLoading = false
                            result.onSuccess { session ->
                                sessionManager.saveSession(session)
                                onLoginSuccess(session)
                            }.onFailure { err ->
                                errorMessage = err.message ?: "Authentication failed."
                            }
                        }
                    },
                    enabled = !isLoading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(22.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = if (!isStaffPinTab) "Sign In" else "Unlock POS",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                }

                Spacer(Modifier.height(16.dp))

                Text(
                    text = "Device ID: $deviceId",
                    fontSize = 10.sp,
                    color = Color(0xFF64748B)
                )
            }
        }
    }
}
