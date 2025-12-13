# ThanawiyaPro API Test Script
# Run this script in PowerShell to test all API endpoints

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "   ThanawiyaPro Backend API Testing" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$testResults = @()

# Helper function to make API calls
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = $null,
        [bool]$ExpectSuccess = $true
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        
        if ($response.success -eq $ExpectSuccess) {
            Write-Host " ✅ PASSED" -ForegroundColor Green
            $script:testResults += @{Name=$Name; Status="PASSED"; Response=$response}
            return $response
        } else {
            Write-Host " ❌ FAILED (Unexpected success value)" -ForegroundColor Red
            $script:testResults += @{Name=$Name; Status="FAILED"; Response=$response}
            return $null
        }
    } catch {
        if (-not $ExpectSuccess) {
            Write-Host " ✅ PASSED (Expected failure)" -ForegroundColor Green
            $script:testResults += @{Name=$Name; Status="PASSED"}
            return $null
        }
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{Name=$Name; Status="FAILED"; Error=$_.Exception.Message}
        return $null
    }
}

# Test 1: API Root
Write-Host "`n--- Testing API Root ---" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
    Write-Host "✅ API Root: Server is running" -ForegroundColor Green
    Write-Host "   Version: $($response.version)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API Root: Server not responding" -ForegroundColor Red
    exit 1
}

# Test 2: Authentication Endpoints
Write-Host "`n--- Testing Authentication Endpoints ---" -ForegroundColor Yellow

# Login as Student
$loginResponse = Test-Endpoint `
    -Name "Login (Student)" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{email="ahmed.student@test.com"; password="Test123!"}

$studentToken = $loginResponse.data.token
$studentId = $loginResponse.data.user._id

# Login as Tutor
$tutorLoginResponse = Test-Endpoint `
    -Name "Login (Tutor)" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{email="mohamed.tutor@test.com"; password="Test123!"}

$tutorToken = $tutorLoginResponse.data.token
$tutorUserId = $tutorLoginResponse.data.user._id

# Login as Admin
$adminLoginResponse = Test-Endpoint `
    -Name "Login (Admin)" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{email="admin@thanawiyapro.com"; password="Test123!"}

$adminToken = $adminLoginResponse.data.token

# Get current user
Test-Endpoint `
    -Name "Get Current User" `
    -Method "GET" `
    -Endpoint "/auth/me" `
    -Token $studentToken | Out-Null

# Test invalid login
Test-Endpoint `
    -Name "Login (Invalid Credentials)" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{email="test@test.com"; password="wrong"} `
    -ExpectSuccess $false

# Test 3: Tutor Endpoints
Write-Host "`n--- Testing Tutor Endpoints ---" -ForegroundColor Yellow

# Get all tutors (public)
$tutorsResponse = Test-Endpoint `
    -Name "Get All Tutors" `
    -Method "GET" `
    -Endpoint "/tutors"

$tutorId = $tutorsResponse.data[0]._id

# Get tutors with filters
Test-Endpoint `
    -Name "Filter Tutors (by subject)" `
    -Method "GET" `
    -Endpoint "/tutors?subject=الرياضيات" | Out-Null

Test-Endpoint `
    -Name "Filter Tutors (by rate)" `
    -Method "GET" `
    -Endpoint "/tutors?minRate=50`&maxRate=70" | Out-Null

# Get single tutor
Test-Endpoint `
    -Name "Get Tutor by ID" `
    -Method "GET" `
    -Endpoint "/tutors/$tutorId" | Out-Null

# Test 4: User Endpoints
Write-Host "`n--- Testing User Endpoints ---" -ForegroundColor Yellow

# Get all users (admin only)
Test-Endpoint `
    -Name "Get All Users (Admin)" `
    -Method "GET" `
    -Endpoint "/users" `
    -Token $adminToken | Out-Null

# Get user by ID
Test-Endpoint `
    -Name "Get User by ID" `
    -Method "GET" `
    -Endpoint "/users/$studentId" `
    -Token $studentToken | Out-Null

# Update user profile
Test-Endpoint `
    -Name "Update User Profile" `
    -Method "PUT" `
    -Endpoint "/users/$studentId" `
    -Body @{bio="Updated bio from API test"} `
    -Token $studentToken | Out-Null

# Test 5: Booking Endpoints
Write-Host "`n--- Testing Booking Endpoints ---" -ForegroundColor Yellow

# Create booking
$bookingResponse = Test-Endpoint `
    -Name "Create Booking" `
    -Method "POST" `
    -Endpoint "/bookings" `
    -Body @{
        tutorId=$tutorUserId
        subject="الرياضيات"
        sessionDate="2025-12-25T15:00:00"
        duration=2
        sessionType="online"
        notes="API test booking"
    } `
    -Token $studentToken

if ($bookingResponse) {
    $bookingId = $bookingResponse.data._id
    
    # Get all bookings
    Test-Endpoint `
        -Name "Get All Bookings" `
        -Method "GET" `
        -Endpoint "/bookings" `
        -Token $studentToken | Out-Null
    
    # Get booking by ID
    Test-Endpoint `
        -Name "Get Booking by ID" `
        -Method "GET" `
        -Endpoint "/bookings/$bookingId" `
        -Token $studentToken | Out-Null
    
    # Confirm booking (as tutor)
    Test-Endpoint `
        -Name "Confirm Booking (Tutor)" `
        -Method "PUT" `
        -Endpoint "/bookings/$bookingId" `
        -Body @{status="confirmed"} `
        -Token $tutorToken | Out-Null
    
    # Complete booking (as tutor)
    Test-Endpoint `
        -Name "Complete Booking (Tutor)" `
        -Method "PUT" `
        -Endpoint "/bookings/$bookingId" `
        -Body @{status="completed"} `
        -Token $tutorToken | Out-Null
    
    # Rate booking (as student)
    Test-Endpoint `
        -Name "Rate Booking (Student)" `
        -Method "PUT" `
        -Endpoint "/bookings/$bookingId" `
        -Body @{rating=5; review="Excellent session from API test!"} `
        -Token $studentToken | Out-Null
}

# Test 6: Payment Endpoints
Write-Host "`n--- Testing Payment Endpoints ---" -ForegroundColor Yellow

# Create deposit
Test-Endpoint `
    -Name "Create Deposit" `
    -Method "POST" `
    -Endpoint "/payments" `
    -Body @{
        type="deposit"
        amount=500
        method="credit_card"
        description="API test deposit"
    } `
    -Token $studentToken | Out-Null

# Get all payments
Test-Endpoint `
    -Name "Get All Payments" `
    -Method "GET" `
    -Endpoint "/payments" `
    -Token $studentToken | Out-Null

# Get payments with filter
Test-Endpoint `
    -Name "Filter Payments (by type)" `
    -Method "GET" `
    -Endpoint "/payments?type=deposit" `
    -Token $studentToken | Out-Null

# Test 7: Authorization Tests
Write-Host "`n--- Testing Authorization ---" -ForegroundColor Yellow

# Try to access admin endpoint without admin token
Test-Endpoint `
    -Name "Get Users (Non-Admin)" `
    -Method "GET" `
    -Endpoint "/users" `
    -Token $studentToken `
    -ExpectSuccess $false

# Try to access protected route without token
Test-Endpoint `
    -Name "Get Bookings (No Token)" `
    -Method "GET" `
    -Endpoint "/bookings" `
    -ExpectSuccess $false

# Test 8: Error Handling
Write-Host "`n--- Testing Error Handling ---" -ForegroundColor Yellow

# Invalid user ID
Test-Endpoint `
    -Name "Get Invalid User ID" `
    -Method "GET" `
    -Endpoint "/users/invalidid123" `
    -Token $adminToken `
    -ExpectSuccess $false

# Non-existent endpoint
Test-Endpoint `
    -Name "Non-existent Endpoint" `
    -Method "GET" `
    -Endpoint "/nonexistent" `
    -ExpectSuccess $false

# Summary
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "   Test Summary" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$passed = ($testResults | Where-Object {$_.Status -eq "PASSED"}).Count
$failed = ($testResults | Where-Object {$_.Status -eq "FAILED"}).Count
$total = $testResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passed/$total)*100, 2))%`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "🎉 All tests passed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some tests failed. Check the output above for details." -ForegroundColor Yellow
}

Write-Host "`n================================================`n" -ForegroundColor Cyan
