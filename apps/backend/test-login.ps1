$baseUrl = "http://localhost:3000/api"

$loginBody = @{
    email = "admin@example.com"
    password = "Admin@123456"
} | ConvertTo-Json

Write-Host "Testing login..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

Write-Host "Success: $($response.success)" -ForegroundColor Green
Write-Host "User: $($response.data.user | ConvertTo-Json -Depth 3)"
Write-Host ""
Write-Host "Access Token (first 50 chars): $($response.data.accessToken.Substring(0, 50))..."
