$ErrorActionPreference = "Continue"
$sdk = "C:\Users\chhun\AppData\Local\Android\Sdk"
$ndkDir = Join-Path $sdk "ndk\25.1.8937393"

Write-Output "=== NDK dir listing (before) ==="
if (Test-Path $ndkDir) { Get-ChildItem $ndkDir -Force | Select-Object Name | ForEach-Object { $_.Name } } else { Write-Output "(missing)" }

# Locate sdkmanager
$candidates = @(
  (Join-Path $sdk "cmdline-tools\latest\bin\sdkmanager.bat"),
  (Join-Path $sdk "cmdline-tools\bin\sdkmanager.bat"),
  (Join-Path $sdk "tools\bin\sdkmanager.bat")
)
$sm = $null
foreach ($c in $candidates) { if (Test-Path $c) { $sm = $c; break } }
Write-Output "=== sdkmanager: $sm ==="
if (-not $sm) {
  Write-Output "ERROR: sdkmanager not found. Listing cmdline-tools:"
  Get-ChildItem (Join-Path $sdk "cmdline-tools") -Force -ErrorAction SilentlyContinue | ForEach-Object { $_.Name }
  Write-Output "DONE-FAIL"
  exit 1
}

# Remove broken NDK
Write-Output "=== Removing broken NDK ==="
Remove-Item -Recurse -Force $ndkDir -ErrorAction SilentlyContinue
if (Test-Path $ndkDir) { Write-Output "WARN: could not remove $ndkDir (locked?)" } else { Write-Output "removed ok" }

# Install NDK (auto-accept license)
Write-Output "=== Installing ndk;25.1.8937393 ==="
cmd /c "echo y| `"$sm`" `"ndk;25.1.8937393`""
Write-Output "sdkmanager exit code: $LASTEXITCODE"

Write-Output "=== source.properties present? ==="
$sp = Join-Path $ndkDir "source.properties"
if (Test-Path $sp) { Write-Output "YES"; Get-Content $sp } else { Write-Output "NO" }
Write-Output "DONE-OK"
