# add-test-players.ps1
# Usage:
#   1) Save this as add-test-players.ps1
#   2) Run: .\add-test-players.ps1
#   3) Enter game code + count when asked

$api = "http://localhost:8000/api"

$code = Read-Host "Enter active game code (example: ABC123)"
$countInput = Read-Host "How many players to create?"
[int]$count = 0
if (-not [int]::TryParse($countInput, [ref]$count) -or $count -le 0) {
    Write-Host "Invalid count. Please enter a positive number." -ForegroundColor Red
    exit 1
}

try {
    # Resolve instance from code
    $joinBody = @{ code = $code } | ConvertTo-Json
    $join = Invoke-RestMethod -Method Post -Uri "$api/join" -ContentType "application/json" -Body $joinBody
    $instanceId = $join.id

    if (-not $instanceId) {
        Write-Host "Could not resolve instance_id from code." -ForegroundColor Red
        exit 1
    }

    Write-Host "Instance found: $instanceId" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to join with that code. Check code/API state." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Name parts for random Latvian-like names
$firstNames = @(
    "Janis","Anna","Martins","Elina","Rihards","Laura","Edgars","Liga","Toms","Kate",
    "Roberts","Marta","Arturs","Ieva","Niks","Alise","Karlis","Paula","Miks","Aija"
)
$lastNames = @(
    "Berzins","Kalnins","Ozolins","Liepa","Krumins","Silins","Eglitis","Zarins","Abols","Petersons",
    "Lacis","Vilks","Jansons","Murnieks","Straume","Balodis","Ceplis","Rudzitis","Grinbergs","Sprogis"
)

$usedNames = New-Object "System.Collections.Generic.HashSet[string]"
$created = 0
$failed = 0

for ($i = 1; $i -le $count; $i++) {
    # Ensure uniqueness in this run
    do {
        $first = Get-Random -InputObject $firstNames
        $last = Get-Random -InputObject $lastNames
        $suffix = Get-Random -Minimum 10 -Maximum 99
        $playerName = "$first $last $suffix"
    } while (-not $usedNames.Add($playerName))

    $body = @{
        instance_id = $instanceId
        player_name = $playerName
    } | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod -Method Post -Uri "$api/create-player" -ContentType "application/json" -Body $body
        $created++
        Write-Host ("[{0}/{1}] Created: {2}" -f $i, $count, $playerName) -ForegroundColor Green
    } catch {
        $failed++
        Write-Host ("[{0}/{1}] Failed: {2}" -f $i, $count, $playerName) -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done. Created: $created, Failed: $failed" -ForegroundColor Cyan