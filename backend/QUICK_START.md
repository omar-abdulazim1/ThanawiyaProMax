# ThanawiyaPro Backend - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Prerequisites
- ✅ Node.js installed (v16 or higher)
- ✅ MongoDB installed and running
- ✅ Git (optional)

---

## Step 1: Setup Backend (2 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies (takes ~1 minute)
npm install

# Seed database with sample data (takes ~10 seconds)
npm run seed
```

**Expected Output:**
```
✅ Database seeding completed successfully!

📊 Summary:
   Users: 6
   Tutors: 3
   Bookings: 6
   Payments: 7

🔑 Test Credentials:
   Student: ahmed.student@test.com / Test123!
   Tutor: mohamed.tutor@test.com / Test123!
   Admin: admin@thanawiyapro.com / Test123!
```

---

## Step 2: Start Server (10 seconds)

```bash
# Start the backend server
npm start
```

**Expected Output:**
```
Server running in development mode on port 5000
MongoDB Connected: 127.0.0.1
```

✅ **Server is running at:** `http://localhost:5000`

---

## Step 3: Test API (1 minute)

### Option A: Using Browser
Open: `http://localhost:5000/`

You should see:
```json
{
  "success": true,
  "message": "ThanawiyaPro API is running",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "tutors": "/api/tutors",
    "bookings": "/api/bookings",
    "payments": "/api/payments"
  }
}
```

### Option B: Test Login (PowerShell)
```powershell
# Test login endpoint
$body = @{
    email = "ahmed.student@test.com"
    password = "Test123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

### Option C: Using curl (Git Bash / WSL)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmed.student@test.com","password":"Test123!"}'
```

---

## 🎯 What You Get

### ✅ 27 API Endpoints Ready to Use:
- **4 Auth endpoints** - Register, login, profile, password update
- **7 User endpoints** - CRUD, balance, favorites
- **6 Tutor endpoints** - Profile management, search, filters
- **5 Booking endpoints** - Create, manage, rate sessions
- **5 Payment endpoints** - Deposits, withdrawals, history

### ✅ 4 Database Collections:
- **Users** (6 sample users)
- **Tutors** (3 sample tutors)
- **Bookings** (6 sample bookings)
- **Payments** (7 sample transactions)

### ✅ Features Working:
- JWT Authentication
- Role-based Access (Student/Tutor/Admin)
- Password Hashing
- Error Handling
- Request Logging

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | ahmed.student@test.com | Test123! |
| Student | fatima.student@test.com | Test123! |
| Tutor | mohamed.tutor@test.com | Test123! |
| Tutor | sara.tutor@test.com | Test123! |
| Admin | admin@thanawiyapro.com | Test123! |

---

## 📚 Next Steps

1. **Read Full Documentation**: Check `README.md`
2. **Test All Endpoints**: See `API_TESTING.md`
3. **Review Implementation**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🐛 Troubleshooting

### Server won't start?
```bash
# Check if MongoDB is running
Get-Process mongod

# If not running, start MongoDB service (as admin)
net start MongoDB
```

### Port 5000 already in use?
Edit `.env` file:
```env
PORT=5001
```

### Database connection failed?
Check `.env` file:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/thanawiyapro
```

---

## 📞 Quick Commands Reference

```bash
# Install dependencies
npm install

# Seed database
npm run seed

# Start server (production)
npm start

# Start server (development with auto-reload)
npm run dev

# Reset database (reseed)
npm run seed
```

---

## ✨ You're Ready!

Your backend is now running and ready to:
- Accept API requests from frontend
- Authenticate users with JWT
- Manage tutors, bookings, and payments
- Handle all CRUD operations

**Happy Coding! 🚀**

---

## 🔗 Useful Links

- API Root: http://localhost:5000/
- Auth Endpoint: http://localhost:5000/api/auth/login
- Tutors List: http://localhost:5000/api/tutors
- MongoDB: mongodb://127.0.0.1:27017/thanawiyapro

---

*Need help? Check the full documentation in README.md or API_TESTING.md*
