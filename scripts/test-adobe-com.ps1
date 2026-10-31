# Test Adobe COM Automation
try {
    Write-Host "Checking Photoshop COM..."
    $ps = New-Object -ComObject "Photoshop.Application"
    Write-Host "Photoshop COM SUCCESS: $($ps.Version)"
} catch {
    Write-Host "Photoshop COM Failed: $($_.Exception.Message)"
}

try {
    Write-Host "Checking Illustrator COM..."
    $ai = New-Object -ComObject "Illustrator.Application"
    Write-Host "Illustrator COM SUCCESS: $($ai.Version)"
} catch {
    Write-Host "Illustrator COM Failed: $($_.Exception.Message)"
}

