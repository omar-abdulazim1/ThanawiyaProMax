# ThanawiyaPro (ثانوية برو) 🎓

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22.12.0-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**منصة تعليمية متكاملة تربط طلاب الجامعة بطلاب الثانوية العامة لتوفير دروس خصوصية بأسعار معقولة**

A comprehensive educational platform connecting university students with high school students to provide affordable private tutoring services. Built with MERN stack (MongoDB, Express.js, React, Node.js).

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [System Architecture](#-system-architecture)
- [Demo Accounts](#-demo-accounts--testing)
- [Key Features](#-key-features)
- [Application Pages](#-application-pages)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Testing Guide](#-testing-guide)
- [Data Management](#-data-management)
- [Advanced Features](#-advanced-features)
- [Available Commands](#-available-commands)
- [Future Development](#-future-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ibrasonic/thanawiyapro.git
cd thanawiyapro

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Start MongoDB (make sure MongoDB is installed)
mongod

# Run backend server (in one terminal)
cd backend
npm start

# Run frontend development server (in another terminal)
npm run dev

# Open browser at
http://localhost:5173
# Backend API: http://localhost:5000
```

---

## 🏗️ Backend Architecture

### System Overview
ThanawyiaPro uses a **MERN Stack** architecture with a RESTful API design:

```
┌─────────────────┐
│  React Frontend │ ← Vite Development Server (Port 5173)
│   (Client SPA)  │
└────────┬────────┘
         │ HTTP/HTTPS
         │ Axios Requests
         ↓
┌─────────────────┐
│  Express.js API │ ← Node.js Server (Port 5000)
│   (REST API)    │
└────────┬────────┘
         │ Mongoose ODM
         │ MongoDB Driver
         ↓
┌─────────────────┐
│  MongoDB        │ ← NoSQL Database (Port 27017)
│  (thanawiyapro) │
└─────────────────┘
```

### Backend Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/
│   ├── authController.js     # Authentication logic (register, login, getMe)
│   ├── userController.js     # User CRUD operations
│   ├── tutorController.js    # Tutor management & approval
│   ├── bookingController.js  # Booking creation & management
│   └── paymentController.js  # Payment processing & approval
├── middleware/
│   ├── authMiddleware.js     # JWT verification & role-based access
│   ├── errorHandler.js       # Global error handling
│   └── validators.js         # Input validation middleware
├── models/
│   ├── User.js               # User schema (students, admins)
│   ├── Tutor.js              # Tutor profile schema
│   ├── Booking.js            # Session booking schema
│   └── Payment.js            # Payment transaction schema
├── routes/
│   ├── authRoutes.js         # /api/auth/* endpoints
│   ├── userRoutes.js         # /api/users/* endpoints
│   ├── tutorRoutes.js        # /api/tutors/* endpoints
│   ├── bookingRoutes.js      # /api/bookings/* endpoints
│   └── paymentRoutes.js      # /api/payments/* endpoints
├── utils/
│   └── asyncHandler.js       # Async error wrapper
├── .env                      # Environment variables
├── package.json              # Backend dependencies
└── server.js                 # Application entry point
```

### Key Features

#### 🔐 Authentication System
- **JWT-based authentication** with token expiration
- Password hashing using **bcrypt** (10 rounds)
- Role-based access control (student, tutor, admin)
- Protected routes with middleware
- Token stored in localStorage (frontend)

#### 📊 Database Models

**User Model** (`users` collection)
- Authentication fields (email, phone, password, role)
- Profile information (name, avatar, balance)
- Role: student or admin
- Timestamps (createdAt, updatedAt)

**Tutor Model** (`tutors` collection)
- References User model (userId)
- Academic info (university, major, year, GPA)
- Teaching details (subjects, hourlyRate, bio)
- Availability schedule
- Approval status (pending, approved, rejected)
- Statistics (rating, totalEarnings, studentsCount)

**Booking Model** (`bookings` collection)
- References User and Tutor
- Session details (subject, date, duration, price)
- Status (pending, confirmed, completed, cancelled)
- Notes and feedback

**Payment Model** (`payments` collection)
- References User
- Type (deposit, withdrawal, booking, refund)
- Method (wallet, instapay, vodafone, bank, fawry)
- Amount and transaction details
- Status (pending, completed, failed, cancelled, rejected)
- Transaction proof and rejection reason

#### 🛡️ Security Features
- **Password encryption** with bcrypt
- **JWT token validation** on protected routes
- **Input sanitization** and validation
- **CORS configuration** for frontend origin
- **Error handling** with custom error classes
- **Rate limiting** (can be added)
- **SQL injection prevention** (using Mongoose)

#### 📡 API Design
- **RESTful architecture** with proper HTTP methods
- **JSON responses** with consistent structure
- **Status codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)
- **Error messages** in Arabic and English
- **Pagination** support (can be added)
- **Filtering and sorting** support

---

## ⚙️ Environment Setup

### Prerequisites
- **Node.js** v16+ (recommended v22.12.0)
- **MongoDB** v6+ (local or MongoDB Atlas)
- **npm** or **yarn**
- **Git**

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/thanawiyapro
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/thanawiyapro

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Optional: Email Configuration (for future use)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Optional: Payment Gateway (for future use)
# FAWRY_MERCHANT_CODE=your_merchant_code
# FAWRY_SECRET_KEY=your_secret_key
```

### Database Setup

1. **Install MongoDB:**
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow [official guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB:**
   ```bash
   # Windows (as service)
   net start MongoDB
   
   # Mac/Linux
   mongod --dbpath /usr/local/var/mongodb
   
   # Or use MongoDB Compass GUI
   ```

3. **Create Database:**
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Create database
   use thanawiyapro
   
   # Database will be created automatically on first insert
   ```

4. **Sample Data** (automatically created on first user registration):
   - 14 users (students and admins)
   - 7 tutors with complete profiles
   - Sample bookings and payments

### Installation Steps

1. **Clone and Install:**
   ```bash
   git clone https://github.com/ibrasonic/thanawiyapro.git
   cd thanawiyapro
   
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

2. **Configure Environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your settings
   nano .env
   ```

3. **Start Services:**
   ```bash
   # Terminal 1: Start MongoDB
   mongod
   
   # Terminal 2: Start Backend
   cd backend
   npm start
   
   # Terminal 3: Start Frontend
   npm run dev
   ```

4. **Verify Setup:**
   - Backend: http://localhost:5000/api/auth/me (should return 401)
   - Frontend: http://localhost:5173 (should load app)
   - Database: `mongosh` → `use thanawiyapro` → `show collections`

### Troubleshooting

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
mongod --dbpath /path/to/your/data
```

**Port Already in Use:**
```bash
# Windows: Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**CORS Error:**
- Make sure `CLIENT_URL` in `.env` matches your frontend URL
- Check that backend is running on port 5000

---

## 🔐 Demo Accounts & Testing

### Test Accounts

| Role | Email | Phone | Password |
|------|-------|-------|----------|
| **Student** | ahmed.student@test.com | 01012345678 | Test123! |
| **Tutor** | mohamed.tutor@test.com | 01234567890 | Test123! |
| **Admin** | admin@thanawiyapro.com | - | Test123! |

> **Note:** You can login using either email or phone number

### Student Account Details
- **Name:** أحمد محمد علي
- **Track:** علمي رياضة
- **Available Pages:**
  - `/student/dashboard` - Dashboard
  - `/student/find-tutors` - Find Tutors
  - `/student/tutor/:id` - Tutor Profile
  - `/student/bookings` - Booking Management
  - `/student/chat/:id` - Chat System
  - `/student/payment-methods` - Payment Methods
  - `/checkout` - Checkout Page

### Tutor Account Details
- **Name:** محمد حسن إبراهيم
- **University:** القاهرة (Cairo)
- **Major:** هندسة (Engineering)
- **Year:** الثالثة (Third)
- **Subjects:** الرياضيات، الفيزياء
- **Rate:** 60 EGP/hour
- **Rating:** 4.9/5
- **Students:** 15
- **Total Earnings:** 4,500 EGP
- **Available Pages:**
  - `/tutor/dashboard` - Dashboard
  - `/tutor/profile` - Profile
  - `/tutor/sessions` - Session Management
  - `/tutor/students` - Students List
  - `/tutor/earnings` - Earnings Report
  - `/tutor/messages` - Messages
  - `/tutor/payment-methods` - Payment Methods

### Admin Account Details
- **Available Pages:**
  - `/admin/dashboard` - Dashboard
  - `/admin/users` - User Management
  - `/admin/tutors` - Tutor Review & Approval
  - `/admin/bookings` - Booking Management
  - `/admin/reports` - Reports & Analytics
  - `/admin/settings` - Platform Settings

---

## ✨ Key Features

### 🎯 Three-Role System

#### 🎓 **For Students**
- 🔍 Search tutors by subject, price, and rating
- 📅 Book sessions and manage appointments
- 💬 Direct messaging with tutors
- ⭐ Rate tutors after sessions
- 💳 Manage payment methods (Wallet, Instapay, Vodafone Cash, Bank Transfer, Fawry)
- ❤️ Add tutors to favorites
- 📊 Track statistics and bookings

#### 👨‍🏫 **For Tutors**
- 💰 Earnings dashboard with real-time statistics from database
- 📆 Session and schedule management
- 👥 Student tracking
- 💳 Withdrawal method configuration (Instapay, Vodafone Cash, Bank Transfer, Fawry)
- 💸 Request withdrawals with minimum 100 EGP (3-5 business days processing)
- 💬 Messaging system with students
- 📈 Performance and rating tracking
- 📊 Monthly earnings breakdown and transaction history

#### 👨‍💼 **For Admins**
- 📊 Comprehensive control dashboard
- ✅ Review and approve/reject new tutors
- 👥 User management (students and tutors)
- 📋 Booking management
- � Payment approval system (deposits and withdrawals)
- 📝 Transaction proof review and verification
- ❌ Reject payments with reason
- �📈 Detailed reports and analytics
- ⚙️ Platform settings

### 💎 Technical Features

✅ **Fully Responsive Design** - Works on all devices  
✅ **Backend Integration** - Node.js + Express + MongoDB  
✅ **RESTful API** - 29 API endpoints  
✅ **Database Integration** - MongoDB with Mongoose ODM  
✅ **Authentication System** - JWT-based authentication  
✅ **Payment Processing** - Multi-method payment system with approval workflow  
✅ **Lazy Loading** - Smart page loading  
✅ **Error Boundary** - Error handling  
✅ **Code Splitting** - Optimized code bundles  
✅ **Custom Hooks** - Reusable hooks  
✅ **API Service Layer** - Organized service layer with centralized API calls  
✅ **Protected Routes** - Role-based route protection  
✅ **Toast Notifications** - Interactive notifications  
✅ **WCAG 2.1 AA** - Accessibility compliance  
✅ **RTL Support** - Full Arabic language support  
✅ **Form Validation** - Input validation (Egyptian phone, email, strong password)  
✅ **Real-time Data** - All pages fetch live data from database

---

## 🧪 Testing Guide

### How to Test

1. **Start the Project**
   ```bash
   npm install
   npm run dev
   ```

2. **Open Browser**
   Navigate to: `http://localhost:5173`

3. **Login**
   - Click "تسجيل الدخول" (Login)
   - Choose login method (email or phone)
   - Use one of the test accounts above

### Testing Registration

#### Register as Student:
1. Go to `/register`
2. Select "طالب" (Student)
3. Fill in the data:
   - Name (minimum 3 characters)
   - Email (valid format)
   - Phone (11 digits starting with 010/011/012/015)
   - Password (8+ chars, uppercase, lowercase, numbers)
4. Choose track (علمي علوم, علمي رياضة, or أدبي)
5. Select subjects (based on track)
6. Complete registration

#### Register as Tutor:
1. Go to `/register`
2. Select "مدرس" (Tutor)
3. Fill basic information
4. Fill academic data:
   - University
   - Major
   - Academic year
5. Select subjects to teach
6. Set hourly rate (10-500 EGP)
7. Choose available days
8. Complete registration

**Note:** Tutor account will be pending until approved by admin.

### Testing Features

#### ✓ Payment System (Student - Wallet Charging)
1. Login as student
2. Go to "طرق الدفع" (Payment Methods)
3. Charge wallet using:
   - **Wallet** - Instant balance (default method for bookings)
   - **Instapay** - Enter phone/instapay address and amount
   - **Vodafone Cash** - Enter phone number and amount
   - **Bank Transfer** - Transfer to bank account (بنك مصر, Account: 1234567890123456, IBAN: EG380002001234567890123456789)
   - **Fawry** - Use code 8374629 and upload receipt
4. Upload transaction proof (screenshot/receipt) for non-wallet methods
5. Wait for admin approval (status shows as pending)
6. Balance updated after approval

#### ✓ Tutor Withdrawal System
1. Login as tutor
2. Configure withdrawal method in "طرق الدفع":
   - **Instapay** - Phone number or instapay address (name@instapay)
   - **Vodafone Cash** - Phone number
   - **Bank Transfer** - Account number, IBAN, and bank name
   - **Fawry** - Phone number and account name
3. Go to "الأرباح" (Earnings)
4. Click "سحب الأرباح" (Withdraw)
5. Enter amount (minimum 100 EGP, maximum available balance)
6. Select withdrawal method (Instapay, Vodafone, Bank, or Fawry)
7. Request submitted for admin approval (3-5 business days)

#### ✓ Admin Payment Approval
1. Login as admin
2. Go to "المدفوعات" (Payments)
3. View pending deposits and withdrawals
4. Click "عرض التفاصيل" to view transaction details
5. Review transaction proof/receipt
6. Approve or reject with reason
7. User balance updated automatically on approval

#### ✓ Favorites
1. Login as student
2. Search for tutors
3. Click heart icon to add to favorites
4. Go to tutor page and click "أضف للمفضلة"
5. Status is saved across all pages

#### ✓ Bookings
1. Login as student
2. Go to "حجوزاتي" (My Bookings)
3. View bookings with different statuses:
   - Confirmed (can join)
   - Pending (can confirm payment)
   - Completed (can book again)
4. Click "تأكيد الدفع" for pending bookings
5. Default payment method auto-selected

#### ✓ Tutor Dashboard
1. Login as tutor
2. View statistics:
   - Monthly earnings
   - Number of sessions
   - Number of students
   - Average rating
3. Go to "الأرباح" (Earnings) to view charts
4. Go to "الرسائل" (Messages) to communicate with students
5. Go to "طرق الدفع" (Payment Methods) to manage bank accounts

#### ✓ Admin Dashboard
1. Login as admin
2. View platform statistics
3. Go to "مراجعة المدرسين" (Tutor Review)
4. Review new tutors and approve/reject
5. Go to "إدارة المستخدمين" (User Management)
6. Search users and modify their status

### Important Test Points

#### Navigation & Security
- ✅ Try accessing protected pages without login
- ✅ Try accessing pages of different roles (e.g., student accessing tutor page)
- ✅ Navigate between pages using menus
- ✅ Use browser back button

#### Responsive Design
- ✅ Test on large screen (Desktop)
- ✅ Test on tablet (768px-1024px)
- ✅ Test on mobile (< 768px)
- ✅ Verify menus display correctly

#### Accessibility
- ✅ Navigate with keyboard (Tab to navigate, Enter to click)
- ✅ Read text with screen reader
- ✅ Verify clear focus indicators
- ✅ Test contrast ratios

#### Functions
- ✅ Login and logout
- ✅ Register as student and tutor
- ✅ Search tutors with filters
- ✅ Book session
- ✅ Manage payment methods
- ✅ Add/remove from favorites
- ✅ Pay from bookings page

### 🐛 Bug Reporting

If you find any issues during testing:
1. Check Console in Developer Tools (F12)
2. Take screenshot of screen and error
3. Write steps to reproduce the issue
4. Report issue in [GitHub Issues](https://github.com/ibrasonic/thanawiyapro/issues)

---

## 📚 Application Pages

### 🌐 Public Pages (3)
- 🏠 Home Page
- 🔐 Login (email or phone)
- 📝 Register (student/tutor)

### 🎓 Student Dashboard (6)
- 📊 Dashboard
- 🔍 Find Tutors
- 👤 Tutor Profile
- 📅 Booking Management
- 💬 Chat System
- 💳 Payment Methods

### 👨‍🏫 Tutor Dashboard (6)
- 📊 Dashboard
- 👤 Profile
- 📆 Session Management
- 👥 Students
- 💰 Earnings
- 💬 Messages
- 💳 Payment Methods

### 👨‍💼 Admin Dashboard (6)
- 📊 Dashboard
- 👥 User Management
- ✅ Tutor Review
- 📋 Booking Management
- 📈 Reports & Analytics
- ⚙️ Platform Settings

### 💳 Payment System (1)
- 🛒 Checkout Page

### 🔍 Additional (1)
- ❌ 404 Page

**Total: 24 Complete Pages**

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI library
- **Vite** 6.0.7 - Build tool
- **React Router** 7.9.6 - Navigation
- **Bootstrap** 5.3.8 - CSS framework
- **React Bootstrap** 2.10.10 - Bootstrap components for React
- **React Icons** 5.5.0 - Icon library
- **Chart.js** 4.5.1 + **react-chartjs-2** 5.3.1 - Charts
- **react-toastify** 11.0.5 - Notifications

### Backend
- **Node.js** v22.12.0 - JavaScript runtime
- **Express.js** 4.18.2 - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** 8.9.4 - MongoDB ODM
- **bcryptjs** 2.4.3 - Password hashing
- **jsonwebtoken** 9.0.2 - JWT authentication
- **express-validator** 7.2.1 - Request validation
- **morgan** 1.10.0 - HTTP request logger
- **cors** 2.8.5 - CORS middleware
- **dotenv** 16.4.7 - Environment variables

### Dev Tools
- **ESLint** 9.39.1 - Code linting
- **Prettier** 3.6.2 - Code formatting
- **eslint-plugin-jsx-a11y** 6.10.2 - Accessibility linting
- **nodemon** 3.1.9 - Auto-restart for development

---

## 📂 Project Structure

```
thanawiyapro/
├── backend/                   # Backend API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── tutorController.js
│   │   ├── bookingController.js
│   │   └── paymentController.js
│   ├── middleware/           # Express middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validators.js
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Tutor.js
│   │   ├── Booking.js
│   │   └── Payment.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── tutorRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── paymentRoutes.js
│   ├── utils/                # Utilities
│   │   └── asyncHandler.js
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── server.js             # Entry point
├── public/
│   ├── data.json             # Legacy demo data
│   └── logo.svg               
├── src/
│   ├── components/           # Shared components
│   │   ├── ErrorBoundary.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── NavigationBar.jsx
│   ├── pages/                # Application pages
│   │   ├── student/          # 6 student pages (API integrated)
│   │   ├── tutor/            # 7 tutor pages (API integrated)
│   │   ├── admin/            # 6 admin pages (API integrated)
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Checkout.jsx
│   │   └── NotFound.jsx
│   ├── services/             # Service layer
│   │   └── backendApi.js     # API client (29 endpoints)
│   ├── context/              # React Context
│   │   └── AuthContext.jsx   # Auth state management
│   ├── utils/                # Helper functions
│   │   ├── storage.js
│   │   └── helpers.js
│   ├── App.jsx               # Main component
│   ├── main.jsx              # Entry point
│   ├── App.css               # App styles
│   └── index.css             # Global styles
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── LICENSE
└── README.md                 # This file
```

---

## 💾 Data Management

### Database: MongoDB (thanawiyapro)

**Collections:**
- **users** - Student and admin accounts
- **tutors** - Tutor profiles and academic information
- **bookings** - Session bookings and scheduling
- **payments** - All payment transactions (deposits, withdrawals, bookings)

**Sample Data:**
- 14 Users (students and admins)
- 7 Tutors (with complete profiles)
- ~16 Bookings (confirmed, pending, completed)
- ~23 Payments (completed and pending transactions)

### API Endpoints (29 total)

**Authentication (4)**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/password` - Update password

**Users (7)**
- GET `/api/users` - Get all users (admin)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user profile
- DELETE `/api/users/:id` - Delete user (admin)
- PUT `/api/users/:id/balance` - Update user balance
- POST `/api/users/:id/favorites/:tutorId` - Add tutor to favorites
- DELETE `/api/users/:id/favorites/:tutorId` - Remove tutor from favorites

**Tutors (6)**
- GET `/api/tutors` - Get all tutors
- GET `/api/tutors/:id` - Get tutor by ID
- GET `/api/tutors/user/:userId` - Get tutor by user ID
- POST `/api/tutors` - Create tutor profile
- PUT `/api/tutors/:id` - Update tutor
- DELETE `/api/tutors/:id` - Delete tutor (admin)

**Bookings (5)**
- GET `/api/bookings` - Get all bookings (filtered by role)
- GET `/api/bookings/:id` - Get booking by ID
- POST `/api/bookings` - Create new booking
- PUT `/api/bookings/:id` - Update booking (status, rating, review)
- DELETE `/api/bookings/:id` - Delete booking (admin)

**Payments (7)**
- GET `/api/payments` - Get all payments (filtered by role)
- GET `/api/payments/:id` - Get payment by ID
- POST `/api/payments` - Create payment (deposit/withdrawal/booking)
- PUT `/api/payments/:id/approve` - Approve payment (admin)
- PUT `/api/payments/:id/reject` - Reject payment with reason (admin)
- PUT `/api/payments/:id` - Update payment status (admin)
- DELETE `/api/payments/:id` - Delete payment (admin)

### Important Notes
- All frontend pages now fetch real data from MongoDB
- JWT-based authentication with token expiry
- Password hashing using bcrypt
- Input validation on both frontend and backend
- Error handling with custom error classes
- Legacy `public/data.json` kept for reference only

---

## 🎨 Advanced Features

### Security
- ✅ Password encryption using bcrypt
- ✅ Role-based route protection
- ✅ Input validation (Egyptian phone, email)
- ✅ Strong password requirements (8+ chars, uppercase, lowercase, numbers)

### Performance
- ✅ Lazy loading for pages
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Caching strategy

### Accessibility (WCAG 2.1 AA)
- ✅ Screen reader support
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA labels for interactive elements
- ✅ Semantic HTML
- ✅ Clear focus indicators
- ✅ High contrast ratios for text

### Payment System
- ✅ **Five Payment Methods:**
  - 💰 **Wallet** - Instant balance (default for bookings)
  - 📱 **Instapay** - Phone number or instapay address (name@instapay)
  - 📱 **Vodafone Cash** - Mobile wallet
  - 🏦 **Bank Transfer** - Direct bank deposit (بنك مصر and 7 other banks)
  - 🎫 **Fawry** - Payment code: 8374629

- ✅ **Student Features:**
  - Charge wallet using any payment method
  - Upload transaction proof (screenshot/receipt)
  - Track pending deposits
  - Use wallet balance for instant booking

- ✅ **Tutor Features:**
  - Configure withdrawal methods
  - Request withdrawals (min 100 EGP)
  - Track earnings and transaction history
  - Monthly earnings breakdown
  - 3-5 business days processing time

- ✅ **Admin Approval Workflow:**
  - Review all deposits and withdrawals
  - View transaction proofs
  - Approve or reject with reason
  - Automatic balance updates
  - Transaction status tracking

- ✅ **Payment Types:**
  - Deposit - Student wallet charging
  - Withdrawal - Tutor earnings withdrawal
  - Booking - Session payment
  - Refund - Cancelled session refund

- ✅ **Database Schema:**
  - Payment model with validation
  - Transaction ID generation
  - Status tracking (pending, completed, failed, cancelled, rejected)
  - Transaction proof storage
  - Rejection reason logging

---

## 🚀 Available Commands

### Frontend
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend
```bash
# Start server (with nodemon)
cd backend
npm start

# Start MongoDB
mongod

# Access MongoDB shell
mongosh thanawiyapro
```

### Database Commands
```javascript
// View collections
show collections

// Count documents
db.users.countDocuments()
db.tutors.countDocuments()
db.bookings.countDocuments()
db.payments.countDocuments()

// View recent data
db.payments.find().sort({_id: -1}).limit(5)
db.bookings.find().sort({_id: -1}).limit(5)
```

---

## 📖 Additional Resources

For detailed testing procedures and more information, all test accounts and features are documented above in the [Demo Accounts & Testing](#-demo-accounts--testing) and [Testing Guide](#-testing-guide) sections.

---

## 🌟 Completed Features

### ✅ Backend Integration
- ✅ REST API with Node.js/Express (29 endpoints)
- ✅ MongoDB database with Mongoose ODM
- ✅ JWT Authentication with token management
- ✅ Multi-method payment system with approval workflow
- ✅ Real-time data fetching across all pages
- ✅ Password hashing with bcrypt
- ✅ Input validation and error handling
- ✅ CORS configuration for frontend-backend communication

### ✅ Payment System
- ✅ Five payment methods (Wallet, Instapay, Vodafone, Bank, Fawry)
- ✅ Student wallet charging with proof upload
- ✅ Tutor withdrawal requests (min 100 EGP)
- ✅ Admin approval/rejection workflow
- ✅ Transaction history and tracking
- ✅ Balance management and updates

### ✅ Database Integration
- ✅ All pages fetch live data from MongoDB
- ✅ User authentication with database
- ✅ Booking management with database
- ✅ Payment transactions in database
- ✅ Sample data for testing

## 🚧 Future Enhancements

### Planned Features
- [ ] Real payment gateway integration (Stripe/Fawry API)
- [ ] Real-time notifications (WebSockets/Socket.io)
- [ ] Live video sessions (WebRTC/Zoom API)
- [ ] Mobile app (React Native)
- [ ] Progressive Web App (PWA)
- [ ] Dark Mode
- [ ] Multi-language support (English/Arabic)
- [ ] Advanced rating and review system
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] AI-powered tutor recommendations
- [ ] Email notifications
- [ ] SMS verification
- [ ] Session recording and playback

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

For any inquiries or suggestions:
- 📧 Email: ibrahim.m.badawy@gmail.com
- 🐛 Report issues: [GitHub Issues](https://github.com/ibrasonic/thanawiyapro/issues)

---

## 👏 Acknowledgments

- Bootstrap for the amazing framework
- React Icons for the icon library
- Chart.js for beautiful charts
- The open-source community

---

**Developed with ❤️ to improve education in Egypt**
