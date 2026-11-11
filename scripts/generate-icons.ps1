# PowerShell script to generate all PWA icon variants from src/app/icon.png
Add-Type -AssemblyName System.Drawing
$rootDir = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $rootDir "src\app\icon.png"
$iconsDir = Join-Path $rootDir "public\icons"

if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null
}

$srcImg = [System.Drawing.Bitmap]::FromFile($srcPath)

function Resize-Image($src, $w, $h, $destPath, [bool]$pad = $false) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    if ($pad) {
        $padX = [int]($w * 0.1)
        $padY = [int]($h * 0.1)
        $targetW = [int]($w * 0.8)
        $targetH = [int]($h * 0.8)
        $g.DrawImage($src, $padX, $padY, $targetW, $targetH)
    } else {
        $g.DrawImage($src, 0, 0, $w, $h)
    }

    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $destPath"
}

Resize-Image $srcImg 192 192 (Join-Path $iconsDir "icon-192x192.png") $false
Resize-Image $srcImg 512 512 (Join-Path $iconsDir "icon-512x512.png") $false
Resize-Image $srcImg 192 192 (Join-Path $iconsDir "icon-maskable-192x192.png") $true
Resize-Image $srcImg 512 512 (Join-Path $iconsDir "icon-maskable-512x512.png") $true
Resize-Image $srcImg 180 180 (Join-Path $iconsDir "apple-touch-icon.png") $false

$srcImg.Dispose()
Write-Host "PWA icons generated successfully."

