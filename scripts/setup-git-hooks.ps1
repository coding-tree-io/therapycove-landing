$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

if (-not (Test-Path ".githooks")) {
    throw "Expected .githooks directory to exist."
}

& git config core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) {
    throw "Failed to set core.hooksPath."
}

Write-Host "Git hooks path set to .githooks"
