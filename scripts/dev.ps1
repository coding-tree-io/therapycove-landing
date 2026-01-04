$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

$decap = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npx decap-server" -WorkingDirectory $projectRoot -NoNewWindow -PassThru

try
{
    bundle exec jekyll serve --config _config.yml,_config.local.yml
}
finally
{
    if ($decap -and -not $decap.HasExited)
    {
        $decap.CloseMainWindow() | Out-Null
        Start-Sleep -Milliseconds 500
        if (-not $decap.HasExited)
        {
            Stop-Process -Id $decap.Id -Force
        }
    }
}