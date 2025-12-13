import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getAllPayments = asyncHandler(async (req, res, next) => {
  const { type, status, userId } = req.query;
  
  let query = {};
  
  // Non-admin users can only see their own payments
  if (req.user.role !== 'admin') {
    query.userId = req.user._id;
  } else if (userId) {
    query.userId = userId;
  }
  
  // Filter by type
  if (type) {
    query.type = type;
  }
  
  // Filter by status
  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate('userId', 'name email')
    .populate('bookingId')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('bookingId');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check if user has access to this payment
  if (
    req.user.role !== 'admin' &&
    payment.userId._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to access this payment', 403));
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Create payment (deposit/withdrawal)
// @route   POST /api/payments
// @access  Private
export const createPayment = asyncHandler(async (req, res, next) => {
  const { type, amount, paymentMethod, description, transactionProof, bookingId } = req.body;

  if (!['deposit', 'withdrawal', 'booking'].includes(type)) {
    return next(new AppError('Invalid payment type', 400));
  }

  if (!amount || amount <= 0) {
    return next(new AppError('Please provide a valid amount', 400));
  }

  const user = await User.findById(req.user._id);

  // Check balance for withdrawal or wallet booking
  if (type === 'withdrawal' && user.balance < amount) {
    return next(new AppError('Insufficient balance', 400));
  }

  // Determine status based on payment method
  // Wallet payments are instant, others require approval
  const status = paymentMethod === 'wallet' ? 'completed' : 'pending';

  // Create payment record
  const payment = await Payment.create({
    userId: req.user._id,
    bookingId,
    type,
    amount,
    method: paymentMethod, // Schema field is 'method'
    status,
    description: description || `${type} via ${paymentMethod}`,
    transactionProof,
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  });

  // Only update balance immediately for wallet payments or completed status
  if (status === 'completed') {
    if (type === 'deposit') {
      user.balance += amount;
    } else if (type === 'withdrawal' || type === 'booking') {
      user.balance -= amount;
    }
    await user.save();
  }

  await payment.populate('userId', 'name email');

  res.status(201).json({
    success: true,
    message: status === 'completed' ? `${type} successful` : 'Payment submitted for approval',
    data: payment
  });
});

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private/Admin
export const updatePayment = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  if (!['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  payment.status = status;
  await payment.save();

  res.status(200).json({
    success: true,
    message: 'Payment status updated',
    data: payment
  });
});

// @desc    Approve payment (for deposits/withdrawals)
// @route   PUT /api/payments/:id/approve
// @access  Private/Admin
export const approvePayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate('userId');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  if (payment.status !== 'pending') {
    return next(new AppError('Only pending payments can be approved', 400));
  }

  // Update payment status
  payment.status = 'completed';
  await payment.save();

  // Handle balance updates based on payment type
  if (payment.userId) {
    const user = await User.findById(payment.userId._id);
    if (user) {
      if (payment.type === 'deposit') {
        // For deposits (student charging wallet), add to balance
        user.balance += payment.amount;
      } else if (payment.type === 'withdrawal') {
        // For withdrawals (tutor requesting payout), deduct from balance
        // Balance should have been checked when creating the withdrawal
        user.balance -= payment.amount;
      }
      await user.save();
    }
  }

  const actionMessage = payment.type === 'deposit' 
    ? 'Payment approved and balance added' 
    : payment.type === 'withdrawal'
    ? 'Withdrawal approved and funds will be transferred'
    : 'Payment approved successfully';

  res.status(200).json({
    success: true,
    message: actionMessage,
    data: payment
  });
});

// @desc    Reject payment
// @route   PUT /api/payments/:id/reject
// @access  Private/Admin
export const rejectPayment = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  if (payment.status !== 'pending') {
    return next(new AppError('Only pending payments can be rejected', 400));
  }

  payment.status = 'rejected';
  payment.rejectionReason = reason || 'No reason provided';
  await payment.save();

  res.status(200).json({
    success: true,
    message: 'Payment rejected',
    data: payment
  });
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private/Admin
export const deletePayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  await payment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Payment deleted successfully',
    data: {}
  });
});
