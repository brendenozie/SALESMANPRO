$base = "c:\Users\Brenden\Desktop\SalesForce\SalesmanPro-Marketing"
$dirs = @(
    "00-Production-System",
    "01-Product-Research",
    "02-Feature-Library",
    "03-Screen-Recordings",
    "04-Screenshots",
    "05-Brand-Assets",
    "06-Scripts-Storyboards",
    "07-Premiere-Projects",
    "08-Photoshop-Projects",
    "09-Illustrator-Projects",
    "10-Audio-Voiceovers",
    "11-Exports",
    "12-Platform-Variants",
    "13-Campaign-Analytics",
    "14-Production-Documentation",
    "15-Reusable-Templates"
)
New-Item -ItemType Directory -Path $base -Force | Out-Null
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path (Join-Path $base $d) -Force | Out-Null
}
Get-ChildItem -Path $base | Select-Object Name

