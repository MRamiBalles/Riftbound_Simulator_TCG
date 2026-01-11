# Riftbound CardPatchWatcher - GameOps Automation
# Monitors riftbound-data.json and triggers sync/embedding updates.

$dataPath = "d:\Riftbound_Simulator_TCG-1\src\data\riftbound-data.json"
$syncScript = "d:\Riftbound_Simulator_TCG-1\scripts\sync-api-cards.ps1"
$embeddingScript = "d:\Riftbound_Simulator_TCG-1\backend\embeddings\card_embeddings.py"
$pythonPath = "C:\Users\Manu\AppData\Local\Programs\Python\Python312\python.exe"

Write-Host "CardPatchWatcher: Monitoring Riftbound Data Assets..."
Write-Host "Watching: $dataPath"

function Get-FileHash {
    param($Path)
    if (Test-Path $Path) {
        return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
    }
    return $null
}

$lastHash = Get-FileHash -Path $dataPath

while ($true) {
    Start-Sleep -Seconds 10
    
    $currentHash = Get-FileHash -Path $dataPath
    
    if ($null -ne $currentHash -and $currentHash -ne $lastHash) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Change detected in card data! Triggering DataOps Pipeline..."
        
        try {
            # 1. Sync from API (to ensure we have latest text/keywords)
            Write-Host "   - Running Card Sync..."
            powershell -ExecutionPolicy Bypass -File $syncScript | Out-Null
            
            # 2. Regenerate Embeddings
            Write-Host "   - Regenerating Semantic Embeddings..."
            & $pythonPath $embeddingScript | Out-Null
            
            $lastHash = Get-FileHash -Path $dataPath
            Write-Host "Success: Intelligence Ecosystem synchronized with latest patch."
        }
        catch {
            Write-Error "DataOps Pipeline Failure: $($_.Exception.Message)"
        }
    }
}
