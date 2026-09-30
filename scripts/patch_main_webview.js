const fs = require('fs');
const p = 'C:/Users/Brenden/AndroidStudioProjects/Salesmanpro/app/src/main/java/site/salesmanpro/android/ui/screens/MainWebViewScreen.kt';
let code = fs.readFileSync(p, 'utf8');

// Replace fun MainWebViewScreen signature
code = code.replace(
  `fun MainWebViewScreen(\n    webInterface: WebAppInterface,\n    modifier: Modifier = Modifier,`,
  `fun MainWebViewScreen(\n    url: String? = null,\n    webInterface: WebAppInterface,\n    modifier: Modifier = Modifier,`
);

// Replace entryUrl determination
code = code.replace(
  `val baseUrl = "https://auth.salesmanpro.site"\n    val dashboardUrl = "$baseUrl/dashboards"\n    val entryUrl = "$baseUrl/api/auth/handover?target=$dashboardUrl"`,
  `val baseUrl = "https://salesmanpro.site"\n    val dashboardUrl = "$baseUrl/dashboards"\n    val entryUrl = url ?: "$baseUrl/dashboards"`
);

fs.writeFileSync(p, code, 'utf8');
console.log('Updated MainWebViewScreen.kt with url parameter');
