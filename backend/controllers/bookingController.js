import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Tutor from '../models/Tutor.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
export const getAllBookings = asyncHandler(async (req, res, next) => {
  const { status, studentId, tutorId, fromDate, toDate } = req.query;
  
  let query = {};
  
  // Non-admin users can only see their own bookings
  if (req.user.role !== 'admin') {
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'tutor') {
      query.tutorId = req.user._id;
    }
  } else {
    // Admin can filter by student or tutor
    if (studentId) query.studentId = studentId;
    if (tutorId) query.tutorId = tutorId;
  }
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by date range
  if (fromDate || toDate) {
    query.sessionDate = {};
    if (fromDate) query.sessionDate.$gte = new Date(fromDate);
    if (toDate) query.sessionDate.$lte = new Date(toDate);
  }

  const bookings = await Booking.find(query)
    .populate('studentId', 'name email phone avatar')
    .populate('tutorId', 'name email phone avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('studentId', 'name email phone avatar')
    .populate('tutorId', 'name email phone avatar');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user has access to this booking
  if (
    req.user.role !== 'admin' &&
    booking.studentId._id.toString() !== req.user._id.toString() &&
    booking.tutorId._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to access this booking', 403));
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res, next) => {
  const { tutorId, subject, sessionDate, duration, sessionType, location, notes } = req.body;

  // Get tutor profile to calculate price
  const tutor = await Tutor.findOne({ userId: tutorId });
  if (!tutor) {
    return next(new AppError('Tutor not found', 404));
  }

  // Calculate total price
  const totalPrice = tutor.hourlyRate * duration;

  // Check if student has sufficient balance
  const student = await User.findById(req.user._id);
  if (student.balance < totalPrice) {
    return next(new AppError('Insufficient balance. Please add funds to your wallet.', 400));
  }

  // Create booking
  const booking = await Booking.create({
    studentId: req.user._id,
    tutorId,
    subject,
    sessionDate,
    duration,
    hourlyRate: tutor.hourlyRate,
    totalPrice,
    sessionType,
    location,
    notes,
    status: 'pending'
  });

  // Deduct from student balance
  student.balance -= totalPrice;
  await student.save();

  // Create payment record
  await Payment.create({
    userId: req.user._id,
    bookingId: booking._id,
    type: 'booking',
    amount: totalPrice,
    method: 'wallet',
    status: 'completed',
    description: `Payment for booking with ${tutor.userId}`
  });

  await booking.populate(['studentId', 'tutorId'], 'name email phone avatar');

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  const { status, rating, review } = req.body;

  // Check authorization based on status change
  if (status) {
    // Students can only cancel
    if (req.user._id.toString() === booking.studentId.toString()) {
      if (status !== 'cancelled') {
        return next(new AppError('Students can only cancel bookings', 403));
      }
    }
    // Tutors can confirm, complete, or reject
    else if (req.user._id.toString() === booking.tutorId.toString()) {
      if (!['confirmed', 'completed', 'rejected'].includes(status)) {
        return next(new AppError('Invalid status update for tutor', 403));
      }
    }
    // Admin can change to any status
    else if (req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this booking', 403));
    }

    // Handle cancellation
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      booking.cancelledBy = req.user._id;
      booking.cancelledAt = Date.now();
      booking.cancellationReason = req.body.cancellationReason;
      
      // Refund student if payment was made
      if (booking.paymentStatus === 'paid') {
        const student = await User.findById(booking.studentId);
        student.balance += booking.totalPrice;
        await student.save();
        
        booking.paymentStatus = 'refunded';
        
        // Create refund payment record
        await Payment.create({
          userId: booking.studentId,
          bookingId: booking._id,
          type: 'refund',
          amount: booking.totalPrice,
          method: 'wallet',
          status: 'completed',
          description: 'Refund for cancelled booking'
        });
      }
    }

    // Handle completion
    if (status === 'completed' && booking.status !== 'completed') {
      // Update student stats
      const student = await User.findById(booking.studentId);
      student.completedSessions += 1;
      student.totalSpent += booking.totalPrice;
      await student.save();

      // Update tutor stats
      const tutor = await Tutor.findOne({ userId: booking.tutorId });
      tutor.completedSessions += 1;
      tutor.totalEarnings += booking.totalPrice;
      await tutor.save();

      // Add earnings to tutor balance
      const tutorUser = await User.findById(booking.tutorId);
      tutorUser.balance += booking.totalPrice;
      await tutorUser.save();
    }

    booking.status = status;
  }

  // Add rating and review (only student can rate)
  if ((rating || review) && req.user._id.toString() === booking.studentId.toString()) {
    if (booking.status !== 'completed') {
      return next(new AppError('Can only rate completed sessions', 400));
    }
    
    if (rating) {
      booking.rating = rating;
      
      // Update tutor average rating
      const tutor = await Tutor.findOne({ userId: booking.tutorId });
      const totalRating = (tutor.rating * tutor.totalRatings) + rating;
      tutor.totalRatings += 1;
      tutor.rating = totalRating / tutor.totalRatings;
      await tutor.save();
    }
    
    if (review) booking.review = review;
  }

  await booking.save();
  await booking.populate(['studentId', 'tutorId'], 'name email phone avatar');

  res.status(200).json({
    success: true,
    message: 'Booking updated successfully',
    data: booking
  });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
export const deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  await booking.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Booking deleted successfully',
    data: {}
  });
});
