# Riftbound Card Synchronizer - PowerShell Edition (V4)
# DataOps / GameOps Pipeline

$apiUrl = "https://api.dotgg.gg/cgfw/getcards?game=riftbound&mode=indexed"
$dataPath = "d:\Riftbound_Simulator_TCG-1\src\data\riftbound-data.json"

Write-Host "Starting DataOps: Card Semantic Synchronization (PS Edition V4)..."

try {
    # 1. Fetch from API
    $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing
    $api = $response.Content | ConvertFrom-Json
    
    $fieldNames = $api.names
    $apiCards = $api.data

    $effectIdx = $fieldNames.IndexOf("effect")
    $tagsIdx = $fieldNames.IndexOf("tags")
    $attackIdx = $fieldNames.IndexOf("might")

    Write-Host "API fields identified. Index mapping: Effect=$effectIdx, Tags=$tagsIdx, Might=$attackIdx"

    # Build lookup Hashtable
    $cardLookup = @{}
    foreach ($c in $apiCards) {
        $id = $c[0]
        $cardLookup[$id] = $c
    }
    Write-Host "Hashtable built with $($cardLookup.Count) cards from API."

    # 2. Load Local Data
    if (-not (Test-Path $dataPath)) {
        Write-Error "Local data not found at $dataPath"
        return
    }
    
    $localDataJson = Get-Content -Path $dataPath -Raw | ConvertFrom-Json
    
    $updatedCount = 0
    $missingCount = 0

    # 3. Merge semantic data
    foreach ($card in $localDataJson) {
        $cardId = $card.id
        $apiCardValues = $cardLookup[$cardId]

        # Ensure properties exist on the PSCustomObject
        if (-not $card.PSObject.Properties['text']) { $card | Add-Member -MemberType NoteProperty -Name "text" -Value "" }
        if (-not $card.PSObject.Properties['keywords']) { $card | Add-Member -MemberType NoteProperty -Name "keywords" -Value @() }

        if ($null -ne $apiCardValues) {
            $updatedCount++
            $card.text = $apiCardValues[$effectIdx]
            
            if ($tagsIdx -ge 0 -and $apiCardValues[$tagsIdx]) {
                $card.keywords = $apiCardValues[$tagsIdx]
            }
            
            if (($null -eq $card.attack -or $card.attack -eq 0) -and $apiCardValues[$attackIdx]) {
                $card.attack = [int]$apiCardValues[$attackIdx]
            }
        }
        else {
            # Fuzzy match
            $baseId = ($cardId -split "-")[0..1] -join "-"
            $foundMatch = $false
            
            foreach ($key in $cardLookup.Keys) {
                if ($key.StartsWith($baseId)) {
                    $fuzzyCard = $cardLookup[$key]
                    $card.text = $fuzzyCard[$effectIdx]
                    if ($tagsIdx -ge 0 -and $fuzzyCard[$tagsIdx]) {
                        $card.keywords = $fuzzyCard[$tagsIdx]
                    }
                    $updatedCount++
                    $foundMatch = $true
                    break
                }
            }
            
            if (-not $foundMatch) {
                $missingCount++
            }
        }
    }

    # 4. Save
    $updatedJson = $localDataJson | ConvertTo-Json -Depth 10
    $updatedJson | Out-File -FilePath $dataPath -Encoding utf8

    Write-Host "`nSynchronization Complete:"
    Write-Host "   - Cards processed: $($localDataJson.Count)"
    Write-Host "   - Semantic fields updated: $updatedCount"
    Write-Host "   - Cards skipped: $missingCount"
    Write-Host "Data saved to: src/data/riftbound-data.json"

}
catch {
    $msg = $_.Exception.Message
    Write-Error "DataSync Critical Failure: $msg"
}
