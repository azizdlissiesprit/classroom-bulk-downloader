# Zips up the extension for uploading to the store.
# Run from this folder:  pwsh ./package.ps1

$ErrorActionPreference = "Stop"
$root = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }

# name the zip after the version in the manifest
$manifest = Get-Content (Join-Path $root "manifest.json") -Raw | ConvertFrom-Json
$version = $manifest.version

# only these files belong in the published extension
$include = @(
  "manifest.json",
  "background.js",
  "popup.html",
  "popup.css",
  "popup.js",
  "scanner.js",
  "icons"
)

$paths = $include | ForEach-Object {
  $p = Join-Path $root $_
  if (-not (Test-Path $p)) { throw "Missing required file: $_" }
  $p
}

$out = Join-Path $root "ClassroomBulkDownloader-v$version.zip"
if (Test-Path $out) { Remove-Item $out -Force }

Compress-Archive -Path $paths -DestinationPath $out -Force
Write-Host "Built $out"
