import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { role, search } = req.query;
  
  let query = {};
  
  // Filter by role
  if (role) {
    query.role = role;
  }
  
  // Search by name or email
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query).select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req, res, next) => {
  // Check if user is updating their own profile or is admin
  if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this user', 403));
  }

  // Fields that can be updated
  const { name, phone, bio, track, interests, avatar } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bio) user.bio = bio;
  if (track) user.track = track;
  if (interests) user.interests = interests;
  if (avatar) user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: {}
  });
});

// @desc    Update user balance
// @route   PUT /api/users/:id/balance
// @access  Private
export const updateBalance = asyncHandler(async (req, res, next) => {
  const { amount, operation } = req.body;

  // Only user themselves or admin can update balance
  if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update balance', 403));
  }

  if (!amount || !operation) {
    return next(new AppError('Please provide amount and operation (add/subtract)', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (operation === 'add') {
    user.balance += amount;
  } else if (operation === 'subtract') {
    if (user.balance < amount) {
      return next(new AppError('Insufficient balance', 400));
    }
    user.balance -= amount;
  } else {
    return next(new AppError('Invalid operation. Use "add" or "subtract"', 400));
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Balance updated successfully',
    data: user
  });
});

// @desc    Add tutor to favorites
// @route   POST /api/users/:id/favorites/:tutorId
// @access  Private
export const addFavorite = asyncHandler(async (req, res, next) => {
  // Only user themselves can add favorites
  if (req.user._id.toString() !== req.params.id) {
    return next(new AppError('Not authorized', 403));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if already in favorites
  if (user.favoritesTutors.includes(req.params.tutorId)) {
    return next(new AppError('Tutor already in favorites', 400));
  }

  user.favoritesTutors.push(req.params.tutorId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Tutor added to favorites',
    data: user
  });
});

// @desc    Remove tutor from favorites
// @route   DELETE /api/users/:id/favorites/:tutorId
// @access  Private
export const removeFavorite = asyncHandler(async (req, res, next) => {
  // Only user themselves can remove favorites
  if (req.user._id.toString() !== req.params.id) {
    return next(new AppError('Not authorized', 403));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.favoritesTutors = user.favoritesTutors.filter(
    id => id.toString() !== req.params.tutorId
  );
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Tutor removed from favorites',
    data: user
  });
});
