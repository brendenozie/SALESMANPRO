<#
.SYNOPSIS
    Chrome Browser Access Diagnostic & Health-Check Tool for SalesmanPro Agent.
.DESCRIPTION
    Validates Chrome installation, running processes, remote debugging port (CDP),
    active profiles, and endpoint responsiveness without exposing sensitive data.
    Outputs PASS, FAIL, or NOT VERIFIED for each diagnostic stage.
#>

param(
    [int]$Port = 9222,
    [string]$TargetProfile = "Profile 3",
    [int]$TimeoutSeconds = 5
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       CHROME BROWSER ACCESS HEALTH CHECK & DIAGNOSTICS         " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Target Port:    $Port"
Write-Host "Target Profile: $TargetProfile"
Write-Host "Timestamp:      $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

$OverallStatus = "PASS"

# --- 1. CHROME EXECUTABLE DETECTION ---
Write-Host "[-] Stage 1: Chrome Executable Verification..." -NoNewline
$ChromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$InstalledChrome = $null
foreach ($Path in $ChromePaths) {
    if (Test-Path $Path) {
        $InstalledChrome = $Path
        break
    }
}

if ($InstalledChrome) {
    Write-Host " [PASS]" -ForegroundColor Green
    Write-Host "    Executable: $InstalledChrome" -ForegroundColor Gray
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "    Error: Google Chrome executable not found in standard paths." -ForegroundColor Yellow
    $OverallStatus = "FAIL"
}

# --- 2. CHROME PROCESS AUDIT ---
Write-Host "[-] Stage 2: Chrome Process Audit..." -NoNewline
$ChromeProcesses = Get-Process -Name chrome -ErrorAction SilentlyContinue

if ($ChromeProcesses -and $ChromeProcesses.Count -gt 0) {
    Write-Host " [PASS]" -ForegroundColor Green
    Write-Host "    Active Chrome instances: $($ChromeProcesses.Count) process(es)" -ForegroundColor Gray
} else {
    Write-Host " [NOT VERIFIED]" -ForegroundColor Yellow
    Write-Host "    Notice: No Chrome processes are currently running." -ForegroundColor Gray
    if ($OverallStatus -ne "FAIL") { $OverallStatus = "NOT VERIFIED" }
}

# --- 3. REMOTE DEBUGGING PORT (CDP) LISTENER CHECK ---
Write-Host "[-] Stage 3: Remote Debugging Port ($Port) Listener..." -NoNewline
$PortListener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if ($PortListener) {
    Write-Host " [PASS]" -ForegroundColor Green
    Write-Host "    Listener active on: $($PortListener.LocalAddress):$($PortListener.LocalPort) (PID: $($PortListener.OwningProcess))" -ForegroundColor Gray
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "    Port $Port is NOT listening. Chrome was not launched with --remote-debugging-port=$Port or has stopped." -ForegroundColor Yellow
    $OverallStatus = "FAIL"
}

# --- 4. CDP HTTP ENDPOINT & VERSION INSPECTION ---
Write-Host "[-] Stage 4: CDP Version Endpoint Check..." -NoNewline
$EndpointUrl = "http://127.0.0.1:$Port/json/version"
$EndpointOk = $false

try {
    $VersionResponse = Invoke-RestMethod -Uri $EndpointUrl -TimeoutSec $TimeoutSeconds -ErrorAction Stop
    if ($VersionResponse.Browser) {
        $EndpointOk = $true
        Write-Host " [PASS]" -ForegroundColor Green
        Write-Host "    Browser:       $($VersionResponse.Browser)" -ForegroundColor Gray
        Write-Host "    Protocol:      $($VersionResponse.'Protocol-Version')" -ForegroundColor Gray
        Write-Host "    User Agent:    $($VersionResponse.'User-Agent'.Split(' ')[0]) ..." -ForegroundColor Gray
    }
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "    Error: Could not retrieve metadata from $EndpointUrl ($($_.Exception.Message))" -ForegroundColor Yellow
    $OverallStatus = "FAIL"
}

# --- 5. ACTIVE PAGES & TARGET PROFILE AUDIT ---
Write-Host "[-] Stage 5: Active Tabs & Page Targets..." -NoNewline
if ($EndpointOk) {
    try {
        $Pages = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json/list" -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        Write-Host " [PASS]" -ForegroundColor Green
        Write-Host "    Total Open Targets: $($Pages.Count)" -ForegroundColor Gray
        foreach ($Page in ($Pages | Where-Object { $_.type -eq 'page' } | Select-Object -First 3)) {
            $SafeTitle = if ($Page.title.Length -gt 45) { $Page.title.Substring(0, 42) + "..." } else { $Page.title }
            $SafeUrl = if ($Page.url.Length -gt 60) { $Page.url.Substring(0, 57) + "..." } else { $Page.url }
            Write-Host "      * Tab: $SafeTitle ($SafeUrl)" -ForegroundColor Gray
        }
    } catch {
        Write-Host " [NOT VERIFIED]" -ForegroundColor Yellow
        Write-Host "    Warning: Could not list active tabs ($($_.Exception.Message))" -ForegroundColor Gray
    }
} else {
    Write-Host " [NOT VERIFIED]" -ForegroundColor Yellow
}

# --- 6. TARGET PROFILE FOLDER EXISTENCE ---
Write-Host "[-] Stage 6: Profile Directory Verification ($TargetProfile)..." -NoNewline
$ProfilePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\$TargetProfile"
if (Test-Path $ProfilePath) {
    Write-Host " [PASS]" -ForegroundColor Green
    Write-Host "    Profile Path: $ProfilePath" -ForegroundColor Gray
} else {
    Write-Host " [NOT VERIFIED]" -ForegroundColor Yellow
    Write-Host "    Warning: Profile folder '$TargetProfile' not found in $env:LOCALAPPDATA\Google\Chrome\User Data" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
if ($OverallStatus -eq "PASS") {
    Write-Host "RESULT: ALL CRITICAL STAGES PASSED [PASS]" -ForegroundColor Green
    Write-Host "Browser is healthy, listening on port $Port, and ready for agent CDP interaction." -ForegroundColor Green
} elseif ($OverallStatus -eq "NOT VERIFIED") {
    Write-Host "RESULT: DIAGNOSTICS INCOMPLETE [NOT VERIFIED]" -ForegroundColor Yellow
    Write-Host "Chrome is installed, but the remote debugging session is not currently active." -ForegroundColor Yellow
} else {
    Write-Host "RESULT: HEALTH CHECK FAILED [FAIL]" -ForegroundColor Red
    Write-Host "Action Required: Consult references/troubleshooting-and-recovery.md to restore access." -ForegroundColor Red
}
Write-Host "================================================================" -ForegroundColor Cyan

exit $(if ($OverallStatus -eq "PASS") { 0 } else { 1 })
