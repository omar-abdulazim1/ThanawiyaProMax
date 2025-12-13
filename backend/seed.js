import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Tutor from './models/Tutor.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Read data.json
const dataPath = join(__dirname, '..', 'public', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Map to store old ID to new ObjectId mappings
const userIdMap = new Map();

// Seed Users
const seedUsers = async () => {
  try {
    await User.deleteMany({});
    console.log('Users collection cleared');

    const users = [];
    
    for (const userData of data.users) {
      const user = {
        name: userData.name,
        email: userData.email,
        password: 'Test123!', // Plain password - will be hashed by User model
        phone: userData.phone,
        role: userData.role,
        avatar: userData.avatar || null,
        bio: userData.bio || '',
        balance: userData.balance || 0,
        track: userData.track || null,
        interests: userData.interests || [],
        favoritesTutors: [], // Will update later
        completedSessions: userData.completedSessions || 0,
        totalSpent: userData.totalSpent || 0,
        createdAt: userData.createdAt || new Date()
      };

      users.push(user);
    }

    // Create users one by one to trigger pre-save hook for password hashing
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} users created`);

    // Store mapping of old IDs to new ObjectIds
    data.users.forEach((userData, index) => {
      userIdMap.set(userData.id, createdUsers[index]._id);
    });

    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Seed Tutors
const seedTutors = async () => {
  try {
    await Tutor.deleteMany({});
    console.log('Tutors collection cleared');

    const tutors = [];
    
    for (const userData of data.users) {
      if (userData.role === 'tutor') {
        const tutor = {
          userId: userIdMap.get(userData.id),
          university: userData.university,
          major: userData.major,
          year: userData.year,
          teachingSubjects: userData.teachingSubjects || [],
          hourlyRate: userData.hourlyRate || 50,
          tutorBio: userData.tutorBio || '',
          availability: userData.availability || [],
          rating: userData.rating || 0,
          totalRatings: userData.reviewsCount || 0,
          totalEarnings: userData.totalEarnings || 0,
          completedSessions: userData.completedSessions || 0,
          isVerified: userData.approved || false,
          createdAt: userData.createdAt || new Date()
        };

        tutors.push(tutor);
      }
    }

    const createdTutors = await Tutor.insertMany(tutors);
    console.log(`${createdTutors.length} tutors created`);

    return createdTutors;
  } catch (error) {
    console.error('Error seeding tutors:', error);
    throw error;
  }
};

// Seed Bookings
const seedBookings = async () => {
  try {
    await Booking.deleteMany({});
    console.log('Bookings collection cleared');

    const bookings = [];
    
    for (const bookingData of data.bookings) {
      // Convert date and time to a single Date object
      const sessionDate = new Date(`${bookingData.date}T${bookingData.time || '12:00'}:00`);
      
      const booking = {
        studentId: userIdMap.get(bookingData.studentId),
        tutorId: userIdMap.get(bookingData.tutorId),
        subject: bookingData.subject,
        sessionDate: sessionDate,
        duration: Math.round(bookingData.duration || 1),
        hourlyRate: bookingData.price / (bookingData.duration || 1),
        totalPrice: bookingData.price,
        status: bookingData.status,
        sessionType: bookingData.location === 'online' ? 'online' : 'in-person',
        location: bookingData.meetingLink || null,
        notes: bookingData.notes || '',
        paymentStatus: bookingData.status === 'completed' ? 'paid' : 
                       bookingData.status === 'cancelled' ? 'refunded' : 'pending',
        rating: bookingData.rating || null,
        review: bookingData.review || null,
        cancelledAt: bookingData.cancelledAt || null,
        cancellationReason: bookingData.cancelReason || null,
        createdAt: bookingData.createdAt || new Date()
      };

      bookings.push(booking);
    }

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`${createdBookings.length} bookings created`);

    return createdBookings;
  } catch (error) {
    console.error('Error seeding bookings:', error);
    throw error;
  }
};

// Seed Payments
const seedPayments = async () => {
  try {
    await Payment.deleteMany({});
    console.log('Payments collection cleared');

    const payments = [];
    
    for (const transactionData of data.transactions) {
      let type = 'deposit';
      if (transactionData.type === 'payment') type = 'booking';
      else if (transactionData.type === 'earning') type = 'deposit';
      else if (transactionData.type === 'withdrawal') type = 'withdrawal';
      else if (transactionData.type === 'deposit') type = 'deposit';

      const payment = {
        userId: userIdMap.get(transactionData.userId),
        bookingId: transactionData.bookingId ? 
          (await Booking.findOne({ 
            studentId: userIdMap.get(transactionData.userId) 
          }))?._id : null,
        type: type,
        amount: Math.abs(transactionData.amount),
        method: transactionData.method || 'wallet',
        status: transactionData.status,
        description: transactionData.description,
        transactionId: transactionData.id,
        createdAt: transactionData.createdAt || new Date()
      };

      payments.push(payment);
    }

    const createdPayments = await Payment.insertMany(payments);
    console.log(`${createdPayments.length} payments created`);

    return createdPayments;
  } catch (error) {
    console.error('Error seeding payments:', error);
    throw error;
  }
};

// Update favorites after all users are created
const updateFavorites = async () => {
  try {
    for (const userData of data.users) {
      if (userData.favoritesTutors && userData.favoritesTutors.length > 0) {
        const favoriteTutorIds = userData.favoritesTutors
          .map(oldId => userIdMap.get(oldId))
          .filter(id => id); // Remove any undefined values

        await User.findByIdAndUpdate(
          userIdMap.get(userData.id),
          { favoritesTutors: favoriteTutorIds }
        );
      }
    }
    console.log('Favorites updated');
  } catch (error) {
    console.error('Error updating favorites:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting database seeding...\n');

    await seedUsers();
    await seedTutors();
    await updateFavorites();
    await seedBookings();
    await seedPayments();

    console.log('\n✅ Database seeding completed successfully!\n');
    
    console.log('📊 Summary:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Tutors: ${await Tutor.countDocuments()}`);
    console.log(`   Bookings: ${await Booking.countDocuments()}`);
    console.log(`   Payments: ${await Payment.countDocuments()}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('   Student: ahmed.student@test.com / Test123!');
    console.log('   Tutor: mohamed.tutor@test.com / Test123!');
    console.log('   Admin: admin@thanawiyapro.com / Test123!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
