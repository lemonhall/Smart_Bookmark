param(
  [string]$OutDir = "public/icons"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-SmartBookmarkIcon {
  param(
    [Parameter(Mandatory = $true)][int]$Size,
    [Parameter(Mandatory = $true)][string]$OutPath
  )

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $bgA = [System.Drawing.Color]::FromArgb(255, 17, 24, 39)   # slate-900
  $bgB = [System.Drawing.Color]::FromArgb(255, 30, 41, 59)   # slate-800
  $accent = [System.Drawing.Color]::FromArgb(255, 56, 189, 248) # sky-400
  $accent2 = [System.Drawing.Color]::FromArgb(255, 139, 92, 246) # violet-500
  $stroke = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)

  $bgRect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bgRect,
    $bgA,
    $bgB,
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $g.FillRectangle($bgBrush, $bgRect)

  $margin = [Math]::Max(1, [int][Math]::Round($Size * 0.22))
  $top = [int][Math]::Round($Size * 0.16)
  $bottom = [int][Math]::Round($Size * 0.86)
  $left = $margin
  $right = $Size - $margin
  $notchX = [int][Math]::Round(($left + $right) / 2)
  $notchY = [int][Math]::Round($Size * 0.70)

  [System.Drawing.Point[]]$bookmarkPoints = @(
    (New-Object System.Drawing.Point($left, $top)),
    (New-Object System.Drawing.Point($right, $top)),
    (New-Object System.Drawing.Point($right, $bottom)),
    (New-Object System.Drawing.Point($notchX, $notchY)),
    (New-Object System.Drawing.Point($left, $bottom))
  )

  $bookmarkRect = New-Object System.Drawing.Rectangle($left, $top, ($right - $left), ($bottom - $top))
  $bookmarkBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bookmarkRect,
    $accent,
    $accent2,
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
  )
  $g.FillPolygon($bookmarkBrush, $bookmarkPoints)

  $strokeWidth = [Math]::Max(1, [int][Math]::Round($Size / 32))
  $pen = New-Object System.Drawing.Pen($stroke, $strokeWidth)
  $g.DrawPolygon($pen, $bookmarkPoints)

  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $pen.Dispose()
  $bookmarkBrush.Dispose()
  $bgBrush.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force $OutDir | Out-Null

New-SmartBookmarkIcon -Size 16 -OutPath (Join-Path $OutDir "icon16.png")
New-SmartBookmarkIcon -Size 48 -OutPath (Join-Path $OutDir "icon48.png")
New-SmartBookmarkIcon -Size 128 -OutPath (Join-Path $OutDir "icon128.png")

Write-Host "Generated icons in $OutDir"
