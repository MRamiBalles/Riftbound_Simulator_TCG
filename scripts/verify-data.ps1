# Riftbound Data Verification Script
# Usage: powershell -File scripts/verify-data.ps1

$dataPath = "src/data/riftbound-data.json"

if (-Not (Test-Path $dataPath)) {
    Write-Host "Error: $dataPath not found!" -ForegroundColor Red
    exit 1
}

$data = Get-Content $dataPath -Raw | ConvertFrom-Json
$count = $data.Count

Write-Host "--- Riftbound Data Report ---" -ForegroundColor Cyan
Write-Host "Total Cards Found: $count"

$units = ($data | Where-Object { $_.type -eq "Unit" }).Count
$spells = ($data | Where-Object { $_.type -eq "Spell" }).Count
$legends = ($data | Where-Object { $_.type -eq "Legend" }).Count
$gears = ($data | Where-Object { $_.type -eq "Gear" -or $_.type -eq "Equipment" }).Count

Write-Host "Units: $units"
Write-Host "Spells: $spells"
Write-Host "Legends: $legends"
Write-Host "Gears/Equipment: $gears"

if ($count -lt 519) {
    Write-Host "Warning: Found $count cards, but expected at least 519." -ForegroundColor Yellow
} else {
    Write-Host "Data Integrity: OK (Comprehensive dataset captured)" -ForegroundColor Green
}

# Sample Card Check
$sample = $data[0]
Write-Host "`nSample Card Check (ID: $($sample.id)):"
Write-Host "Name: $($sample.name)"
Write-Host "Has Image URL: $($sample.image_url -match "https://")"
Write-Host "Has Clean Text: $($sample.text -notmatch "<")"

Write-Host "`nVerification Complete." -ForegroundColor Cyan
