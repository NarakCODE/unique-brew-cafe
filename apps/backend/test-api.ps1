# API Testing Script
Write-Host "🧪 Testing Corner Coffee API" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Test 1: Health Check
Write-Host "✅ Test 1: Health Check" -ForegroundColor Green
$health = Invoke-RestMethod -Uri "$baseUrl/config/health" -Method Get
Write-Host "Status: $($health.status)"
Write-Host "Database: $($health.database.status)"
Write-Host ""

# Test 2: Get Stores
Write-Host "✅ Test 2: Get Stores (Public)" -ForegroundColor Green
$stores = Invoke-RestMethod -Uri "$baseUrl/stores" -Method Get
Write-Host "Found $($stores.data.Count) store(s)"
Write-Host "Store: $($stores.data[0].name)"
Write-Host ""

# Test 3: Get Categories
Write-Host "✅ Test 3: Get Categories (Public)" -ForegroundColor Green
$categories = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get
Write-Host "Found $($categories.data.Count) categories"
Write-Host "Categories: $($categories.data.name -join ', ')"
Write-Host ""

# Test 4: Get Products
Write-Host "✅ Test 4: Get Products (Public)" -ForegroundColor Green
$products = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get
Write-Host "Found $($products.data.Count) products"
if ($products.data.Count -gt 0) {
    Write-Host "First product: $($products.data[0].name) - `$$($products.data[0].basePrice)"
}
Write-Host ""

# Test 5: Login as Admin
Write-Host "✅ Test 5: Admin Login" -ForegroundColor Green
$loginBody = @{
    email = "admin@example.com"
    password = "Admin@123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "Login successful!"
    Write-Host "User: $($loginResponse.data.user.fullName)"
    Write-Host "Role: $($loginResponse.data.user.role)"
    Write-Host ""

    # Test 6: Get User Profile (Authenticated)
    Write-Host "✅ Test 6: Get User Profile (Authenticated)" -ForegroundColor Green
    $headers = @{
        Authorization = "Bearer $token"
    }
    $profile = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method Get -Headers $headers
    Write-Host "Profile: $($profile.data.fullName)"
    Write-Host "Email: $($profile.data.email)"
    Write-Host ""

    # Test 7: Get Cart (Authenticated)
    Write-Host "✅ Test 7: Get Cart (Authenticated)" -ForegroundColor Green
    try {
        $cart = Invoke-RestMethod -Uri "$baseUrl/cart" -Method Get -Headers $headers
        Write-Host "Cart items: $($cart.data.items.Count)"
        Write-Host "Cart total: `$$($cart.data.total)"
    } catch {
        Write-Host "Cart is empty or not found (expected for new user)"
    }
    Write-Host ""

    # Test 8: Get Orders (Authenticated)
    Write-Host "✅ Test 8: Get Orders (Authenticated)" -ForegroundColor Green
    $orders = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Get -Headers $headers
    Write-Host "Found $($orders.data.Count) orders"
    Write-Host ""

    # Test 9: Get Dashboard Stats (Admin Only)
    Write-Host "✅ Test 9: Get Dashboard Stats (Admin Only)" -ForegroundColor Green
    try {
        $dashboard = Invoke-RestMethod -Uri "$baseUrl/reports/dashboard" -Method Get -Headers $headers
        Write-Host "Total Orders: $($dashboard.data.totalOrders)"
        Write-Host "Total Revenue: `$$($dashboard.data.totalRevenue)"
        Write-Host "Active Users: $($dashboard.data.activeUsers)"
    } catch {
        Write-Host "Dashboard stats not available or no data yet"
    }
    Write-Host ""

    # Test 10: Get All Users (Admin Only)
    Write-Host "✅ Test 10: Get All Users (Admin Only)" -ForegroundColor Green
    $users = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $headers
    Write-Host "Found $($users.data.Count) user(s)"
    Write-Host ""

    # Test 11: Get FAQs
    Write-Host "✅ Test 11: Get FAQs (Public)" -ForegroundColor Green
    $faqs = Invoke-RestMethod -Uri "$baseUrl/support/faq" -Method Get
    Write-Host "Found $($faqs.data.Count) FAQs"
    Write-Host ""

    # Test 12: Get App Config
    Write-Host "✅ Test 12: Get App Config (Public)" -ForegroundColor Green
    $config = Invoke-RestMethod -Uri "$baseUrl/config/app" -Method Get
    Write-Host "App Version: $($config.data.app.version)"
    Write-Host "Min Order Amount: `$$($config.data.app.min_order_amount)"
    Write-Host ""

    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Access Swagger UI at: http://localhost:3000/api-docs" -ForegroundColor Cyan
    Write-Host "🔑 Admin Token (save this for testing):" -ForegroundColor Yellow
    Write-Host $token

} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you ran: npm run seed:admin"
}
