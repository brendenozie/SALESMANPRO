const fs = require('fs');

let content = fs.readFileSync('scripts/LoginScreen.kt', 'utf8');

// Ensure LocalContext is available inside LoginScreen
if (!content.includes('val context = androidx.compose.ui.platform.LocalContext.current')) {
  content = content.replace(
    'val deviceName = remember { android.os.Build.MODEL }',
    'val deviceName = remember { android.os.Build.MODEL }\n    val context = androidx.compose.ui.platform.LocalContext.current'
  );
}

// Add Google Sign-in button under submit button if not already present
if (!content.includes('Connect with Google')) {
  const target = 'Spacer(Modifier.height(16.dp))\n\n                Text(\n                    text = "Device ID: $deviceId",';
  const replacement = `Spacer(Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFF334155))
                    Text(
                        text = "OR",
                        fontSize = 11.sp,
                        color = Color(0xFF64748B),
                        modifier = Modifier.padding(horizontal = 8.dp),
                        fontWeight = FontWeight.Bold
                    )
                    HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFF334155))
                }

                Spacer(Modifier.height(16.dp))

                // Google Sign In via Custom Tabs to Central Auth Provider
                OutlinedButton(
                    onClick = {
                        val customTabsIntent = androidx.browser.customtabs.CustomTabsIntent.Builder().build()
                        val oauthUrl = "https://auth.salesmanpro.site/signin?auto=google&callbackUrl=salesmanpro%3A%2F%2Fcallback"
                        customTabsIntent.launchUrl(context, android.net.Uri.parse(oauthUrl))
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF475569)),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
                ) {
                    Text(
                        text = "Connect with Google",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.White
                    )
                }

                Spacer(Modifier.height(16.dp))

                Text(
                    text = "Device ID: $deviceId",`;
  content = content.replace(target, replacement);
}

fs.writeFileSync('scripts/LoginScreen.kt', content, 'utf8');
const dest = 'C:/Users/Brenden/AndroidStudioProjects/Salesmanpro/app/src/main/java/site/salesmanpro/android/ui/screens/LoginScreen.kt';
fs.writeFileSync(dest, content, 'utf8');
console.log('Successfully updated LoginScreen.kt in both scripts and Android repo!');
