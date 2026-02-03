$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    throw "npm is required to build the CSS bundle."
}

& npm run build:css
if ($LASTEXITCODE -ne 0) {
    throw "CSS bundle build failed."
}

& git diff --exit-code -- assets/css/site.bundle.css
if ($LASTEXITCODE -ne 0) {
    throw "CSS bundle is out of date. Commit the regenerated bundle."
}
