# Script PowerShell para probar la API en producción
# Uso: .\test-api.ps1 https://tu-app.onrender.com

param(
    [string]$ApiUrl = "https://litebox-challenge-webservice.onrender.com/api"
)

Write-Host "🧪 Testing API at: $ApiUrl" -ForegroundColor Cyan
Write-Host ""

# Test 1: GET posts
Write-Host "📥 Test 1: GET /posts/related" -ForegroundColor Yellow
Write-Host "----------------------------------------"
try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/posts/related" -Method Get -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""

# Test 2: POST - Crear un post
Write-Host "📤 Test 2: POST /posts/related" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "⚠️  Este test requiere una imagen. Ajusta la ruta de la imagen abajo." -ForegroundColor Yellow
Write-Host ""

$imagePath = ".\test_img.jpg"

if (Test-Path $imagePath) {
    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $fileBytes = [System.IO.File]::ReadAllBytes($imagePath)
        $fileName = Split-Path $imagePath -Leaf
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"title`"",
            "",
            "Test Post desde PowerShell",
            "--$boundary",
            "Content-Disposition: form-data; name=`"topic`"",
            "",
            "Testing",
            "--$boundary",
            "Content-Disposition: form-data; name=`"image`"; filename=`"$fileName`"",
            "Content-Type: image/jpeg",
            "",
            [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes),
            "--$boundary--"
        )
        
        $body = $bodyLines -join "`r`n"
        $bodyBytes = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetBytes($body)
        
        $response = Invoke-RestMethod -Uri "$ApiUrl/posts/related" `
            -Method Post `
            -ContentType "multipart/form-data; boundary=$boundary" `
            -Body $bodyBytes
        
        Write-Host "✅ Success!" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Imagen no encontrada en: $imagePath" -ForegroundColor Red
    Write-Host "   Crea una imagen de prueba o ajusta `$imagePath en el script" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Tests completados" -ForegroundColor Green

