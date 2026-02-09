param(
  [string]$DistDir = "dist",
  [string]$OutDir = "artifacts",
  [string]$ZipName = "smart-bookmark.zip"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
  $distPath = Join-Path $repoRoot $DistDir
  $manifestPath = Join-Path $distPath "manifest.json"

  if (!(Test-Path $manifestPath)) {
    throw "Missing $manifestPath. Run `npm run build` first (or use the committed dist)."
  }

  $outPath = Join-Path $repoRoot $OutDir
  New-Item -ItemType Directory -Force $outPath | Out-Null

  $zipPath = Join-Path $outPath $ZipName
  if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
  }

  Compress-Archive -Path (Join-Path $distPath "*") -DestinationPath $zipPath -Force
  Write-Host "Wrote $zipPath"
} finally {
  Pop-Location
}

