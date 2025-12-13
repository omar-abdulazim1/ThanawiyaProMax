# ThanawiyaPro Backend - Comprehensive API Test Suite
# Tests ALL 27 endpoints with full validation

Write-Host "`n" -NoNewline
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  ThanawiyaPro Backend - COMPREHENSIVE API TEST SUITE" -ForegroundColor Cyan
Write-Host "  Testing ALL 27 Endpoints" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "`n"

$baseUrl = "http://localhost:5000/api"
$rootUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0
$testResults = @()

# Test helper function
function Test-APIEndpoint {
    param(
        [string]$TestNumber,
        [string]$Category,
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = $null,
        [bool]$ExpectSuccess = $true,
        [string]$Description = ""
    )
    
    $fullTestName = "[$TestNumber] $Category - $Name"
    Write-Host "$fullTestName" -NoNewline -ForegroundColor White
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = if ($Endpoint.StartsWith("http")) { $Endpoint } else { "$baseUrl$Endpoint" }
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        if ($response.success -eq $ExpectSuccess) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            $script:testsPassed++
            $script:testResults += @{
                Number = $TestNumber
                Category = $Category
                Name = $Name
                Status = "PASS"
                Method = $Method
                Endpoint = $Endpoint
                Description = $Description
            }
            return $response
        } else {
            Write-Host " ❌ FAIL (Unexpected success value)" -ForegroundColor Red
            $script:testsFailed++
            $script:testResults += @{
                Number = $TestNumber
                Category = $Category
                Name = $Name
                Status = "FAIL"
                Method = $Method
                Endpoint = $Endpoint
                Error = "Unexpected success value"
            }
            return $null
        }
    } catch {
        if (-not $ExpectSuccess) {
            Write-Host " ✅ PASS (Expected error)" -ForegroundColor Green
            $script:testsPassed++
            $script:testResults += @{
                Number = $TestNumber
                Category = $Category
                Name = $Name
                Status = "PASS"
                Method = $Method
                Endpoint = $Endpoint
                Description = "Correctly rejected"
            }
            return $null
        }
        
        Write-Host " ❌ FAIL" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        $script:testResults += @{
            Number = $TestNumber
            Category = $Category
            Name = $Name
            Status = "FAIL"
            Method = $Method
            Endpoint = $Endpoint
            Error = $_.Exception.Message
        }
        return $null
    }
}

Write-Host "Checking server connectivity..." -ForegroundColor Yellow
try {
    $serverCheck = Invoke-RestMethod -Uri $rootUrl -Method Get -TimeoutSec 5
    Write-Host "✅ Server is running on port 5000`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not responding. Please start the server first." -ForegroundColor Red
    Write-Host "   Run: node server.js`n" -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# SECTION 1: API ROOT (1 endpoint)
# ============================================================================
Write-Host "`n--- SECTION 1: API ROOT (1 endpoint) ---" -ForegroundColor Cyan

$response = Test-APIEndpoint `
    -TestNumber "1.1" `
    -Category "API Root" `
    -Name "GET /" `
    -Method "GET" `
    -Endpoint $rootUrl `
    -Description "Verify API is running"

# ============================================================================
# SECTION 2: AUTHENTICATION ENDPOINTS (4 endpoints)
# ============================================================================
Write-Host "`n--- SECTION 2: AUTHENTICATION (4 endpoints) ---" -ForegroundColor Cyan

# 2.1 Register new student
$newStudent = Test-APIEndpoint `
    -TestNumber "2.1" `
    -Category "Auth" `
    -Name "POST /auth/register (Student)" `
    -Method "POST" `
    -Endpoint "/auth/register" `
    -Body @{
        name = "Test Student $(Get-Random)"
        email = "teststudent$(Get-Random)@test.com"
        password = "Test123!"
        phone = "01055566677"
        role = "student"
        track = "علمي علوم"
        interests = @("الرياضيات", "الفيزياء")
    } `
    -Description "Register new student"

# 2.2 Register new tutor
$newTutor = Test-APIEndpoint `
    -TestNumber "2.2" `
    -Category "Auth" `
    -Name "POST /auth/register (Tutor)" `
    -Method "POST" `
    -Endpoint "/auth/register" `
    -Body @{
        name = "Test Tutor $(Get-Random)"
        email = "testtutor$(Get-Random)@test.com"
        password = "Test123!"
        phone = "01099988877"
        role = "tutor"
        university = "Test University"
        major = "Computer Science"
        year = "الثالثة"
        teachingSubjects = @("الرياضيات")
        hourlyRate = 50
        tutorBio = "Test tutor bio"
    } `
    -Description "Register new tutor"

# 2.3 Login as student
$studentLogin = Test-APIEndpoint `
    -TestNumber "2.3" `
    -Category "Auth" `
    -Name "POST /auth/login (Student)" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{
        email = "ahmed.student@test.com"
        password = "Test123!"
    } `
    -Description "Login as student"

$studentToken = $studentLogin.data.token
$studentId = $studentLogin.data.user._id

# 2.4 Login as tutor
$tutorLogin = Test-APIEndpoint `
    -TestNumber "2.4" `
    -Category "Auth" `
    -Name "POST /auth/login (Tutor)" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{
        email = "mohamed.tutor@test.com"
        password = "Test123!"
    } `
    -Description "Login as tutor"

$tutorToken = $tutorLogin.data.token
$tutorUserId = $tutorLogin.data.user._id

# 2.5 Login as admin
$adminLogin = Test-APIEndpoint `
    -TestNumber "2.5" `
    -Category "Auth" `
    -Name "POST /auth/login (Admin)" `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body @{
        email = "admin@thanawiyapro.com"
        password = "Test123!"
    } `
    -Description "Login as admin"

$adminToken = $adminLogin.data.token

# 2.6 Get current user (student)
Test-APIEndpoint `
    -TestNumber "2.6" `
    -Category "Auth" `
    -Name "GET /auth/me (Student)" `
    -Method "GET" `
    -Endpoint "/auth/me" `
    -Token $studentToken `
    -Description "Get current student profile" | Out-Null

# 2.7 Get current user (tutor)
Test-APIEndpoint `
    -TestNumber "2.7" `
    -Category "Auth" `
    -Name "GET /auth/me (Tutor)" `
    -Method "GET" `
    -Endpoint "/auth/me" `
    -Token $tutorToken `
    -Description "Get current tutor profile" | Out-Null

# 2.8 Update password
Test-APIEndpoint `
    -TestNumber "2.8" `
    -Category "Auth" `
    -Name "PUT /auth/password" `
    -Method "PUT" `
    -Endpoint "/auth/password" `
    -Body @{
        currentPassword = "Test123!"
        newPassword = "NewTest123!"
    } `
    -Token $studentToken `
    -Description "Update password" | Out-Null

# Change password back
Invoke-RestMethod -Uri "$baseUrl/auth/password" -Method Put -Body (@{currentPassword="NewTest123!"; newPassword="Test123!"} | ConvertTo-Json) -Headers @{Authorization="Bearer $studentToken"; "Content-Type"="application/json"} -ErrorAction SilentlyContinue | Out-Null

# ============================================================================
# SECTION 3: TUTOR ENDPOINTS (6 endpoints)
# ============================================================================
Write-Host "`n--- SECTION 3: TUTOR MANAGEMENT (6 endpoints) ---" -ForegroundColor Cyan

# 3.1 Get all tutors
$tutorsResponse = Test-APIEndpoint `
    -TestNumber "3.1" `
    -Category "Tutors" `
    -Name "GET /tutors" `
    -Method "GET" `
    -Endpoint "/tutors" `
    -Description "Get all tutors (public)"

$tutorId = $tutorsResponse.data[0]._id
$testTutorUserId = $tutorsResponse.data[0].userId._id

# 3.2 Filter tutors by subject
Test-APIEndpoint `
    -TestNumber "3.2" `
    -Category "Tutors" `
    -Name "GET /tutors?subject=..." `
    -Method "GET" `
    -Endpoint "/tutors?subject=الرياضيات" `
    -Description "Filter by subject" | Out-Null

# 3.3 Filter tutors by rate range
Test-APIEndpoint `
    -TestNumber "3.3" `
    -Category "Tutors" `
    -Name "GET /tutors?minRate=...&maxRate=..." `
    -Method "GET" `
    -Endpoint "/tutors?minRate=40&maxRate=70" `
    -Description "Filter by rate range" | Out-Null

# 3.4 Filter tutors by rating
Test-APIEndpoint `
    -TestNumber "3.4" `
    -Category "Tutors" `
    -Name "GET /tutors?minRating=..." `
    -Method "GET" `
    -Endpoint "/tutors?minRating=4" `
    -Description "Filter by minimum rating" | Out-Null

# 3.5 Get tutor by ID
Test-APIEndpoint `
    -TestNumber "3.5" `
    -Category "Tutors" `
    -Name "GET /tutors/:id" `
    -Method "GET" `
    -Endpoint "/tutors/$tutorId" `
    -Description "Get tutor by ID" | Out-Null

# 3.6 Get tutor by user ID
Test-APIEndpoint `
    -TestNumber "3.6" `
    -Category "Tutors" `
    -Name "GET /tutors/user/:userId" `
    -Method "GET" `
    -Endpoint "/tutors/user/$testTutorUserId" `
    -Description "Get tutor by user ID" | Out-Null

# 3.7 Update tutor profile
$tutorProfileResponse = Invoke-RestMethod -Uri "$baseUrl/tutors/user/$tutorUserId" -Method Get -ErrorAction SilentlyContinue
if ($tutorProfileResponse) {
    $myTutorId = $tutorProfileResponse.data._id
    Test-APIEndpoint `
        -TestNumber "3.7" `
        -Category "Tutors" `
        -Name "PUT /tutors/:id" `
        -Method "PUT" `
        -Endpoint "/tutors/$myTutorId" `
        -Body @{
            tutorBio = "Updated bio from test"
            availability = @("السبت صباحاً", "الأحد مساءً")
        } `
        -Token $tutorToken `
        -Description "Update tutor profile" | Out-Null
}

# ============================================================================
# SECTION 4: USER ENDPOINTS (7 endpoints)
# ============================================================================
Write-Host "`n--- SECTION 4: USER MANAGEMENT (7 endpoints) ---" -ForegroundColor Cyan

# 4.1 Get all users (admin)
Test-APIEndpoint `
    -TestNumber "4.1" `
    -Category "Users" `
    -Name "GET /users (Admin)" `
    -Method "GET" `
    -Endpoint "/users" `
    -Token $adminToken `
    -Description "Get all users as admin" | Out-Null

# 4.2 Get all users with role filter
Test-APIEndpoint `
    -TestNumber "4.2" `
    -Category "Users" `
    -Name "GET /users?role=..." `
    -Method "GET" `
    -Endpoint "/users?role=student" `
    -Token $adminToken `
    -Description "Filter users by role" | Out-Null

# 4.3 Get all users with search
Test-APIEndpoint `
    -TestNumber "4.3" `
    -Category "Users" `
    -Name "GET /users?search=..." `
    -Method "GET" `
    -Endpoint "/users?search=أحمد" `
    -Token $adminToken `
    -Description "Search users by name" | Out-Null

# 4.4 Get user by ID
Test-APIEndpoint `
    -TestNumber "4.4" `
    -Category "Users" `
    -Name "GET /users/:id" `
    -Method "GET" `
    -Endpoint "/users/$studentId" `
    -Token $studentToken `
    -Description "Get user by ID" | Out-Null

# 4.5 Update user profile
Test-APIEndpoint `
    -TestNumber "4.5" `
    -Category "Users" `
    -Name "PUT /users/:id" `
    -Method "PUT" `
    -Endpoint "/users/$studentId" `
    -Body @{
        bio = "Updated bio from comprehensive test"
        interests = @("الرياضيات", "الفيزياء", "الكيمياء")
    } `
    -Token $studentToken `
    -Description "Update user profile" | Out-Null

# 4.6 Update user balance (add)
Test-APIEndpoint `
    -TestNumber "4.6" `
    -Category "Users" `
    -Name "PUT /users/:id/balance (add)" `
    -Method "PUT" `
    -Endpoint "/users/$studentId/balance" `
    -Body @{
        amount = 1000
        operation = "add"
    } `
    -Token $studentToken `
    -Description "Add to balance" | Out-Null

# 4.7 Update user balance (subtract)
Test-APIEndpoint `
    -TestNumber "4.7" `
    -Category "Users" `
    -Name "PUT /users/:id/balance (subtract)" `
    -Method "PUT" `
    -Endpoint "/users/$studentId/balance" `
    -Body @{
        amount = 100
        operation = "subtract"
    } `
    -Token $studentToken `
    -Description "Subtract from balance" | Out-Null

# 4.8 Remove tutor from favorites (cleanup first if exists)
# Get a second tutor for favorites test
$allTutorsForFav = Invoke-RestMethod -Uri "$API_BASE/tutors" -Method GET
if ($allTutorsForFav.data.Count -ge 2) {
    $secondTutorUserId = $allTutorsForFav.data[1].userId._id
} else {
    $secondTutorUserId = $testTutorUserId
}

# Cleanup from favorites
try {
    Invoke-RestMethod -Uri "$API_BASE/users/$studentId/favorites/$secondTutorUserId" `
        -Method DELETE `
        -Headers @{
            "Authorization" = "Bearer $studentToken"
            "Content-Type" = "application/json"
        } -ErrorAction SilentlyContinue | Out-Null
} catch { }

# 4.9 Add tutor to favorites
Test-APIEndpoint `
    -TestNumber "4.8" `
    -Category "Users" `
    -Name "POST /users/:id/favorites/:tutorId" `
    -Method "POST" `
    -Endpoint "/users/$studentId/favorites/$secondTutorUserId" `
    -Token $studentToken `
    -Description "Add tutor to favorites" | Out-Null

# 4.10 Remove tutor from favorites
Test-APIEndpoint `
    -TestNumber "4.9" `
    -Category "Users" `
    -Name "DELETE /users/:id/favorites/:tutorId" `
    -Method "DELETE" `
    -Endpoint "/users/$studentId/favorites/$secondTutorUserId" `
    -Token $studentToken `
    -Description "Remove from favorites" | Out-Null

# ============================================================================
# SECTION 5: BOOKING ENDPOINTS (5 endpoints)
# ============================================================================
Write-Host "`n--- SECTION 5: BOOKING MANAGEMENT (5 endpoints) ---" -ForegroundColor Cyan

# 5.1 Create booking
$bookingResponse = Test-APIEndpoint `
    -TestNumber "5.1" `
    -Category "Bookings" `
    -Name "POST /bookings" `
    -Method "POST" `
    -Endpoint "/bookings" `
    -Body @{
        tutorId = $testTutorUserId
        subject = "الرياضيات"
        sessionDate = "2025-12-30T15:00:00"
        duration = 2
        sessionType = "online"
        notes = "Comprehensive test booking"
    } `
    -Token $studentToken `
    -Description "Create new booking"

$bookingId = $bookingResponse.data._id

# 5.2 Get all bookings (student)
Test-APIEndpoint `
    -TestNumber "5.2" `
    -Category "Bookings" `
    -Name "GET /bookings (Student)" `
    -Method "GET" `
    -Endpoint "/bookings" `
    -Token $studentToken `
    -Description "Get student's bookings" | Out-Null

# 5.3 Get all bookings (tutor)
Test-APIEndpoint `
    -TestNumber "5.3" `
    -Category "Bookings" `
    -Name "GET /bookings (Tutor)" `
    -Method "GET" `
    -Endpoint "/bookings" `
    -Token $tutorToken `
    -Description "Get tutor's bookings" | Out-Null

# 5.4 Get bookings with status filter
Test-APIEndpoint `
    -TestNumber "5.4" `
    -Category "Bookings" `
    -Name "GET /bookings?status=..." `
    -Method "GET" `
    -Endpoint "/bookings?status=pending" `
    -Token $studentToken `
    -Description "Filter by status" | Out-Null

# 5.5 Get booking by ID
Test-APIEndpoint `
    -TestNumber "5.5" `
    -Category "Bookings" `
    -Name "GET /bookings/:id" `
    -Method "GET" `
    -Endpoint "/bookings/$bookingId" `
    -Token $studentToken `
    -Description "Get booking by ID" | Out-Null

# 5.6 Confirm booking (wrong tutor - should fail)
Test-APIEndpoint `
    -TestNumber "5.6" `
    -Category "Bookings" `
    -Name "PUT /bookings/:id (Wrong tutor)" `
    -Method "PUT" `
    -Endpoint "/bookings/$bookingId" `
    -Body @{status = "confirmed"} `
    -Token $tutorToken `
    -ExpectSuccess $false `
    -Description "Wrong tutor can't confirm" | Out-Null

# 5.7 Cancel booking
Test-APIEndpoint `
    -TestNumber "5.7" `
    -Category "Bookings" `
    -Name "PUT /bookings/:id (Cancel)" `
    -Method "PUT" `
    -Endpoint "/bookings/$bookingId" `
    -Body @{
        status = "cancelled"
        cancellationReason = "Test cancellation"
    } `
    -Token $studentToken `
    -Description "Cancel booking" | Out-Null

# ============================================================================
# SECTION 6: PAYMENT ENDPOINTS (5 endpoints)
# ============================================================================
Write-Host "`n--- SECTION 6: PAYMENT MANAGEMENT (5 endpoints) ---" -ForegroundColor Cyan

# 6.1 Create deposit
$depositResponse = Test-APIEndpoint `
    -TestNumber "6.1" `
    -Category "Payments" `
    -Name "POST /payments (Deposit)" `
    -Method "POST" `
    -Endpoint "/payments" `
    -Body @{
        type = "deposit"
        amount = 500
        method = "credit_card"
        description = "Test deposit from comprehensive test"
    } `
    -Token $studentToken `
    -Description "Create deposit"

$paymentId = $depositResponse.data._id

# 6.2 Create withdrawal
Test-APIEndpoint `
    -TestNumber "6.2" `
    -Category "Payments" `
    -Name "POST /payments (Withdrawal)" `
    -Method "POST" `
    -Endpoint "/payments" `
    -Body @{
        type = "withdrawal"
        amount = 100
        method = "bank_transfer"
        description = "Test withdrawal"
    } `
    -Token $studentToken `
    -Description "Create withdrawal" | Out-Null

# 6.3 Get all payments
Test-APIEndpoint `
    -TestNumber "6.3" `
    -Category "Payments" `
    -Name "GET /payments" `
    -Method "GET" `
    -Endpoint "/payments" `
    -Token $studentToken `
    -Description "Get all payments" | Out-Null

# 6.4 Get payments with type filter
Test-APIEndpoint `
    -TestNumber "6.4" `
    -Category "Payments" `
    -Name "GET /payments?type=..." `
    -Method "GET" `
    -Endpoint "/payments?type=deposit" `
    -Token $studentToken `
    -Description "Filter by type" | Out-Null

# 6.5 Get payments with status filter
Test-APIEndpoint `
    -TestNumber "6.5" `
    -Category "Payments" `
    -Name "GET /payments?status=..." `
    -Method "GET" `
    -Endpoint "/payments?status=completed" `
    -Token $studentToken `
    -Description "Filter by status" | Out-Null

# 6.6 Get payment by ID
Test-APIEndpoint `
    -TestNumber "6.6" `
    -Category "Payments" `
    -Name "GET /payments/:id" `
    -Method "GET" `
    -Endpoint "/payments/$paymentId" `
    -Token $studentToken `
    -Description "Get payment by ID" | Out-Null

# 6.7 Update payment status (admin)
Test-APIEndpoint `
    -TestNumber "6.7" `
    -Category "Payments" `
    -Name "PUT /payments/:id (Admin)" `
    -Method "PUT" `
    -Endpoint "/payments/$paymentId" `
    -Body @{status = "completed"} `
    -Token $adminToken `
    -Description "Update payment status" | Out-Null

# ============================================================================
# SECTION 7: AUTHORIZATION TESTS (Security)
# ============================================================================
Write-Host "`n--- SECTION 7: AUTHORIZATION & SECURITY (5 tests) ---" -ForegroundColor Cyan

# 7.1 Access protected route without token
Test-APIEndpoint `
    -TestNumber "7.1" `
    -Category "Security" `
    -Name "GET /bookings (No token)" `
    -Method "GET" `
    -Endpoint "/bookings" `
    -ExpectSuccess $false `
    -Description "No token - should fail" | Out-Null

# 7.2 Student accessing admin endpoint
Test-APIEndpoint `
    -TestNumber "7.2" `
    -Category "Security" `
    -Name "GET /users (Student token)" `
    -Method "GET" `
    -Endpoint "/users" `
    -Token $studentToken `
    -ExpectSuccess $false `
    -Description "Student can't access admin" | Out-Null

# 7.3 Tutor accessing admin endpoint
Test-APIEndpoint `
    -TestNumber "7.3" `
    -Category "Security" `
    -Name "GET /users (Tutor token)" `
    -Method "GET" `
    -Endpoint "/users" `
    -Token $tutorToken `
    -ExpectSuccess $false `
    -Description "Tutor can't access admin" | Out-Null

# 7.4 Invalid user ID
Test-APIEndpoint `
    -TestNumber "7.4" `
    -Category "Security" `
    -Name "GET /users/invalidid" `
    -Method "GET" `
    -Endpoint "/users/invalidid123" `
    -Token $adminToken `
    -ExpectSuccess $false `
    -Description "Invalid ID format" | Out-Null

# 7.5 Non-existent endpoint
Test-APIEndpoint `
    -TestNumber "7.5" `
    -Category "Security" `
    -Name "GET /nonexistent" `
    -Method "GET" `
    -Endpoint "/nonexistent" `
    -ExpectSuccess $false `
    -Description "404 for invalid route" | Out-Null

# ============================================================================
# FINAL RESULTS
# ============================================================================

Write-Host "`n"
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "`n"

$totalTests = $testsPassed + $testsFailed
$successRate = if ($totalTests -gt 0) { [math]::Round(($testsPassed / $totalTests) * 100, 2) } else { 0 }

Write-Host "Total Tests Run:    $totalTests" -ForegroundColor White
Write-Host "Tests Passed:       $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed:       $testsFailed" -ForegroundColor $(if ($testsFailed -gt 0) { "Red" } else { "Green" })
Write-Host "Success Rate:       $successRate%" -ForegroundColor $(if ($successRate -ge 95) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

Write-Host "`n--- Test Breakdown by Category ---" -ForegroundColor Yellow
$categories = $testResults | Group-Object -Property Category
foreach ($category in $categories) {
    $passed = ($category.Group | Where-Object {$_.Status -eq "PASS"}).Count
    $total = $category.Count
    $percent = [math]::Round(($passed / $total) * 100, 0)
    $color = if ($percent -eq 100) { "Green" } elseif ($percent -ge 80) { "Yellow" } else { "Red" }
    Write-Host "$($category.Name): $passed/$total ($percent%)" -ForegroundColor $color
}

if ($testsFailed -gt 0) {
    Write-Host "`n--- Failed Tests ---" -ForegroundColor Red
    $testResults | Where-Object {$_.Status -eq "FAIL"} | ForEach-Object {
        Write-Host "  [$($_.Number)] $($_.Category) - $($_.Name)" -ForegroundColor Red
        if ($_.Error) {
            Write-Host "    Error: $($_.Error)" -ForegroundColor Gray
        }
    }
}

Write-Host "`n"
Write-Host "================================================================" -ForegroundColor Cyan
if ($successRate -eq 100) {
    Write-Host "  ✅ ALL TESTS PASSED! API IS FULLY FUNCTIONAL" -ForegroundColor Green
} elseif ($successRate -ge 95) {
    Write-Host "  ⚠️  MOST TESTS PASSED - MINOR ISSUES DETECTED" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ SIGNIFICANT ISSUES DETECTED - REVIEW REQUIRED" -ForegroundColor Red
}
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "`n"

# Export results to file
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$reportPath = "test-results-$timestamp.json"
$testResults | ConvertTo-Json -Depth 10 | Out-File $reportPath
Write-Host "📄 Detailed results exported to: $reportPath" -ForegroundColor Cyan
Write-Host "`n"
