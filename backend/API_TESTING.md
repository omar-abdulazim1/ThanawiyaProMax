# ThanawiyaPro API Testing Guide

This guide provides examples for testing all API endpoints using various tools.

## 🔧 Testing Tools

You can use any of these tools:
- **VS Code REST Client** extension (recommended)
- **Postman**
- **Thunder Client** VS Code extension
- **curl** command line
- **Browser Dev Tools** (for GET requests)

## 🔐 Authentication

Most endpoints require authentication. First, login to get a JWT token:

### Login Request
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ahmed.student@test.com",
  "password": "Test123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "أحمد محمد علي",
      "email": "ahmed.student@test.com",
      "role": "student",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Use the token in subsequent requests:
```http
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📋 API Endpoints Testing

### 1. Authentication Endpoints

#### 1.1 Register New User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Student",
  "email": "newstudent@test.com",
  "password": "Test123!",
  "phone": "01055566677",
  "role": "student",
  "track": "علمي علوم",
  "interests": ["الرياضيات", "الفيزياء"]
}
```

#### 1.2 Register Tutor
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "New Tutor",
  "email": "newtutor@test.com",
  "password": "Test123!",
  "phone": "01099988877",
  "role": "tutor",
  "university": "جامعة القاهرة",
  "major": "هندسة",
  "year": "الثالثة",
  "teachingSubjects": ["الرياضيات", "الفيزياء"],
  "hourlyRate": 65,
  "tutorBio": "طالب هندسة متميز"
}
```

#### 1.3 Get Current User
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN
```

#### 1.4 Update Password
```http
PUT http://localhost:5000/api/auth/password
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "currentPassword": "Test123!",
  "newPassword": "NewPass123!"
}
```

---

### 2. User Endpoints

#### 2.1 Get All Users (Admin Only)
```http
GET http://localhost:5000/api/users
Authorization: Bearer ADMIN_TOKEN
```

#### 2.2 Get All Users with Filters
```http
GET http://localhost:5000/api/users?role=student&search=أحمد
Authorization: Bearer ADMIN_TOKEN
```

#### 2.3 Get User by ID
```http
GET http://localhost:5000/api/users/USER_ID
Authorization: Bearer YOUR_TOKEN
```

#### 2.4 Update User Profile
```http
PUT http://localhost:5000/api/users/USER_ID
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "Updated bio",
  "interests": ["الرياضيات", "الفيزياء", "الكيمياء"]
}
```

#### 2.5 Update User Balance
```http
PUT http://localhost:5000/api/users/USER_ID/balance
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "amount": 500,
  "operation": "add"
}
```

#### 2.6 Add Tutor to Favorites
```http
POST http://localhost:5000/api/users/STUDENT_ID/favorites/TUTOR_USER_ID
Authorization: Bearer STUDENT_TOKEN
```

#### 2.7 Remove from Favorites
```http
DELETE http://localhost:5000/api/users/STUDENT_ID/favorites/TUTOR_USER_ID
Authorization: Bearer STUDENT_TOKEN
```

---

### 3. Tutor Endpoints

#### 3.1 Get All Tutors (Public)
```http
GET http://localhost:5000/api/tutors
```

#### 3.2 Get Tutors with Filters
```http
GET http://localhost:5000/api/tutors?subject=الرياضيات&minRate=40&maxRate=80&minRating=4
```

#### 3.3 Search Tutors by Name
```http
GET http://localhost:5000/api/tutors?search=محمد
```

#### 3.4 Get Tutor by ID
```http
GET http://localhost:5000/api/tutors/TUTOR_ID
```

#### 3.5 Get Tutor by User ID
```http
GET http://localhost:5000/api/tutors/user/USER_ID
```

#### 3.6 Create Tutor Profile
```http
POST http://localhost:5000/api/tutors
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "university": "جامعة عين شمس",
  "major": "علوم",
  "year": "الثانية",
  "teachingSubjects": ["الكيمياء", "الأحياء"],
  "hourlyRate": 55,
  "tutorBio": "طالب علوم متميز",
  "availability": ["السبت صباحاً", "الأحد مساءً"]
}
```

#### 3.7 Update Tutor Profile
```http
PUT http://localhost:5000/api/tutors/TUTOR_ID
Authorization: Bearer TUTOR_TOKEN
Content-Type: application/json

{
  "hourlyRate": 70,
  "availability": ["السبت صباحاً", "الأحد مساءً", "الثلاثاء مساءً"],
  "tutorBio": "Updated bio"
}
```

---

### 4. Booking Endpoints

#### 4.1 Get All Bookings (Current User)
```http
GET http://localhost:5000/api/bookings
Authorization: Bearer YOUR_TOKEN
```

#### 4.2 Get Bookings with Filters
```http
GET http://localhost:5000/api/bookings?status=confirmed&fromDate=2025-12-01
Authorization: Bearer YOUR_TOKEN
```

#### 4.3 Get Booking by ID
```http
GET http://localhost:5000/api/bookings/BOOKING_ID
Authorization: Bearer YOUR_TOKEN
```

#### 4.4 Create Booking
```http
POST http://localhost:5000/api/bookings
Authorization: Bearer STUDENT_TOKEN
Content-Type: application/json

{
  "tutorId": "TUTOR_USER_ID",
  "subject": "الرياضيات",
  "sessionDate": "2025-12-20T15:00:00",
  "duration": 2,
  "sessionType": "online",
  "notes": "مراجعة التفاضل والتكامل"
}
```

#### 4.5 Confirm Booking (Tutor)
```http
PUT http://localhost:5000/api/bookings/BOOKING_ID
Authorization: Bearer TUTOR_TOKEN
Content-Type: application/json

{
  "status": "confirmed"
}
```

#### 4.6 Complete Booking (Tutor)
```http
PUT http://localhost:5000/api/bookings/BOOKING_ID
Authorization: Bearer TUTOR_TOKEN
Content-Type: application/json

{
  "status": "completed"
}
```

#### 4.7 Cancel Booking (Student)
```http
PUT http://localhost:5000/api/bookings/BOOKING_ID
Authorization: Bearer STUDENT_TOKEN
Content-Type: application/json

{
  "status": "cancelled",
  "cancellationReason": "ظرف طارئ"
}
```

#### 4.8 Rate Booking (Student)
```http
PUT http://localhost:5000/api/bookings/BOOKING_ID
Authorization: Bearer STUDENT_TOKEN
Content-Type: application/json

{
  "rating": 5,
  "review": "شرح ممتاز واستفدت كثيراً"
}
```

---

### 5. Payment Endpoints

#### 5.1 Get All Payments (Current User)
```http
GET http://localhost:5000/api/payments
Authorization: Bearer YOUR_TOKEN
```

#### 5.2 Get Payments with Filters
```http
GET http://localhost:5000/api/payments?type=deposit&status=completed
Authorization: Bearer YOUR_TOKEN
```

#### 5.3 Get Payment by ID
```http
GET http://localhost:5000/api/payments/PAYMENT_ID
Authorization: Bearer YOUR_TOKEN
```

#### 5.4 Deposit Money
```http
POST http://localhost:5000/api/payments
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "type": "deposit",
  "amount": 500,
  "method": "credit_card",
  "description": "إيداع رصيد"
}
```

#### 5.5 Withdraw Money
```http
POST http://localhost:5000/api/payments
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "type": "withdrawal",
  "amount": 200,
  "method": "bank_transfer",
  "description": "سحب أرباح"
}
```

---

## 🧪 Complete Testing Workflow

### Scenario: Student Books a Session with Tutor

1. **Register/Login as Student**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ahmed.student@test.com",
  "password": "Test123!"
}
```
*Save the token from response*

2. **Browse Available Tutors**
```http
GET http://localhost:5000/api/tutors?subject=الرياضيات
```

3. **Add Money to Wallet**
```http
POST http://localhost:5000/api/payments
Authorization: Bearer STUDENT_TOKEN
Content-Type: application/json

{
  "type": "deposit",
  "amount": 500,
  "method": "credit_card"
}
```

4. **Create Booking**
```http
POST http://localhost:5000/api/bookings
Authorization: Bearer STUDENT_TOKEN
Content-Type: application/json

{
  "tutorId": "TUTOR_USER_ID",
  "subject": "الرياضيات",
  "sessionDate": "2025-12-20T15:00:00",
  "duration": 2,
  "sessionType": "online",
  "notes": "مراجعة شاملة"
}
```

5. **Login as Tutor**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "mohamed.tutor@test.com",
  "password": "Test123!"
}
```

6. **Tutor Confirms Booking**
```http
PUT http://localhost:5000/api/bookings/BOOKING_ID
Authorization: Bearer TUTOR_TOKEN
Content-Type: application/json

{
  "status": "confirmed"
}
```

7. **After Session: Tutor Marks as Completed**
```http
PUT http://localhost:5000/api/bookings/BOOKING_ID
Authorization: Bearer TUTOR_TOKEN
Content-Type: application/json

{
  "status": "completed"
}
```

8. **Student Rates the Session**
```http
PUT http://localhost:5000/api/bookings/BOOKING_ID
Authorization: Bearer STUDENT_TOKEN
Content-Type: application/json

{
  "rating": 5,
  "review": "شرح رائع!"
}
```

---

## 📊 Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10  // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## ✅ Test Checklist

- [ ] User can register as student
- [ ] User can register as tutor
- [ ] User can login
- [ ] User can view their profile
- [ ] User can update their profile
- [ ] Student can browse tutors
- [ ] Student can filter tutors by subject/rate
- [ ] Student can add money to wallet
- [ ] Student can create booking
- [ ] Tutor can view bookings
- [ ] Tutor can confirm/reject bookings
- [ ] Tutor can mark session as completed
- [ ] Student can rate completed sessions
- [ ] Student can cancel bookings (with refund)
- [ ] Admin can view all users
- [ ] Admin can view all bookings
- [ ] Authentication prevents unauthorized access

---

## 🔍 Debugging Tips

1. **Check if server is running**: `http://localhost:5000/`
2. **Check MongoDB connection**: Look for "MongoDB Connected" in server logs
3. **Verify token format**: Should be `Bearer eyJhbGciOiJ...`
4. **Check request body**: Must be valid JSON
5. **Review server logs**: Look for detailed error messages
6. **Use correct IDs**: MongoDB ObjectIds (24 hex characters)

---

## 📞 Support

If you encounter issues:
1. Check server console for errors
2. Verify MongoDB is running: `Get-Process mongod`
3. Check .env configuration
4. Review README.md for setup instructions
