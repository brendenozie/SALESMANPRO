$layoutsDir = "c:\Users\Brenden\Desktop\SalesForce\SalesMan\components\site\layouts"
$folders = Get-ChildItem -Directory $layoutsDir | Sort-Object Name

$inventory = @()
$id = 1

foreach ($f in $folders) {
    $storeId = ("STORE-{0:d3}" -f $id)
    $folderName = $f.Name
    $folderPath = $f.FullName
    $bodyPath = Join-Path $folderPath "body"
    $headerPath = Join-Path $folderPath "header"
    $footerPath = Join-Path $folderPath "footer"

    $hasHeader = Test-Path $headerPath
    $hasFooter = Test-Path $footerPath
    $hasBody = Test-Path $bodyPath

    $bodySiteComponent = ""
    if ($hasBody) {
        $siteFile = Get-ChildItem -Path $bodyPath -File | Where-Object { $_.Name -match "Site\.(tsx|jsx|js|ts)$" } | Select-Object -First 1
        if ($siteFile) {
            $bodySiteComponent = $siteFile.BaseName
        }
    }

    # Find cards
    $cardDirs = @()
    if (Test-Path $folderPath) {
        $c = Get-ChildItem -Path $folderPath -Directory -Recurse | Where-Object { $_.Name -match "card" } | Select-Object -ExpandProperty Name
        if ($c) { $cardDirs = $c | Select-Object -Unique }
    }

    # Search for patterns in layout files
    $files = Get-ChildItem -Path $folderPath -File -Recurse | Where-Object { $_.Extension -match "\.(tsx|ts|jsx|js|css)$" }
    $backdropCount = 0
    $unoptimizedCount = 0
    $scrollListenerCount = 0
    $virtualizerCount = 0
    $returnNullCount = 0
    $framerMotionCount = 0

    foreach ($file in $files) {
        $content = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $backdropCount += ([regex]::Matches($content, "backdrop-blur|backdrop-filter")).Count
            $unoptimizedCount += ([regex]::Matches($content, "unoptimized")).Count
            $scrollListenerCount += ([regex]::Matches($content, "addEventListener\(['""]scroll")).Count
            $virtualizerCount += ([regex]::Matches($content, "useWindowVirtualizer|useVirtualizer")).Count
            $returnNullCount += ([regex]::Matches($content, "return\s+null\s*;")).Count
            $framerMotionCount += ([regex]::Matches($content, "from\s+['""]framer-motion['""]|motion\.")).Count
        }
    }

    $item = [PSCustomObject]@{
        id = $storeId
        name = ($folderName -replace "Layout$", "")
        folder = $folderName
        bodySiteComponent = $bodySiteComponent
        hasHeader = $hasHeader
        hasFooter = $hasFooter
        hasBody = $hasBody
        cardComponents = $cardDirs
        backdropFilterOccurrences = $backdropCount
        unoptimizedImageOccurrences = $unoptimizedCount
        scrollListenerOccurrences = $scrollListenerCount
        virtualizerOccurrences = $virtualizerCount
        returnNullOccurrences = $returnNullCount
        framerMotionOccurrences = $framerMotionCount
    }
    $inventory += $item
    $id++
}

$outPath = "c:\Users\Brenden\Desktop\SalesForce\SalesMan\docs\performance\inventory.json"
$inventory | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $outPath -Encoding UTF8
Write-Output "Successfully scanned $($inventory.Count) stores into $outPath"
