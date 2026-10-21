<#
.SYNOPSIS
  Launches Google Chrome with remote debugging on port 9222 for autonomous agent control.

.DESCRIPTION
  Allows selecting which profile to launch with, maintaining all credentials and session state.
  Default autonomous profile: storage/automation/chrome-profile
  Or pass user profile: e.g. -Profile "Profile 3" (Work / brendenodhiambo@gmail.com)
#>

param (
    [string]$ProfileName = "",
    [string]$Url = "https://salesmanpro.store",
    [switch]$UseSystemProfile = $false
)

$ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $ChromePath)) {
    $ChromePath = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
}

if (-not (Test-Path $ChromePath)) {
    Write-Error "Google Chrome executable not found."
    exit 1
}

$UserDataDir = ""
if ($UseSystemProfile) {
    $UserDataDir = "$env:LOCALAPPDATA\Google\Chrome\User Data"
} else {
    $UserDataDir = "$PSScriptRoot\..\storage\automation\chrome-profile"
    if (-not (Test-Path $UserDataDir)) {
        New-Item -ItemType Directory -Path $UserDataDir -Force | Out-Null
    }
}

$Arguments = @(
    "--remote-debugging-port=9222",
    "--user-data-dir=`"$UserDataDir`"",
    "--no-first-run",
    "--no-default-browser-check"
)

if ($ProfileName) {
    $Arguments += "--profile-directory=`"$ProfileName`""
}

if ($Url) {
    $Arguments += "`"$Url`""
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Launching Autonomous Debug Chrome on Port 9222" -ForegroundColor Green
Write-Host "   Binary   : $ChromePath" -ForegroundColor Gray
Write-Host "   Profile  : $UserDataDir $(if ($ProfileName) { "[$ProfileName]" })" -ForegroundColor Gray
Write-Host "   Target   : $Url" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

Start-Process -FilePath $ChromePath -ArgumentList $Arguments

# Test port readiness
$Ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Milliseconds 600
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json/version" -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($res) {
            $Ready = $true
            break
        }
    } catch {}
}

if ($Ready) {
    Write-Host "✅ Chrome is ACTIVE and ready for autonomous agent control on port 9222!" -ForegroundColor Green
} else {
    Write-Host "⏳ Chrome launched. If an existing Chrome process was already running on this profile, close it first or use the autonomous profile." -ForegroundColor Yellow
}
