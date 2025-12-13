import Tutor from '../models/Tutor.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get all tutors
// @route   GET /api/tutors
// @access  Public
export const getAllTutors = asyncHandler(async (req, res, next) => {
  const { subject, minRate, maxRate, minRating, university, year, search } = req.query;
  
  let query = {};
  
  // Filter by subject
  if (subject) {
    query.teachingSubjects = { $in: [subject] };
  }
  
  // Filter by hourly rate range
  if (minRate || maxRate) {
    query.hourlyRate = {};
    if (minRate) query.hourlyRate.$gte = Number(minRate);
    if (maxRate) query.hourlyRate.$lte = Number(maxRate);
  }
  
  // Filter by minimum rating
  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }
  
  // Filter by university
  if (university) {
    query.university = { $regex: university, $options: 'i' };
  }
  
  // Filter by year
  if (year) {
    query.year = year;
  }

  const tutors = await Tutor.find(query)
    .populate('userId', 'name email phone avatar bio')
    .sort('-rating -completedSessions');

  // Search by tutor name if provided
  let filteredTutors = tutors;
  if (search) {
    filteredTutors = tutors.filter(tutor => 
      tutor.userId.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.status(200).json({
    success: true,
    count: filteredTutors.length,
    data: filteredTutors
  });
});

// @desc    Get single tutor
// @route   GET /api/tutors/:id
// @access  Public
export const getTutor = asyncHandler(async (req, res, next) => {
  const tutor = await Tutor.findById(req.params.id)
    .populate('userId', 'name email phone avatar bio createdAt');

  if (!tutor) {
    return next(new AppError('Tutor not found', 404));
  }

  res.status(200).json({
    success: true,
    data: tutor
  });
});

// @desc    Get tutor by user ID
// @route   GET /api/tutors/user/:userId
// @access  Public
export const getTutorByUserId = asyncHandler(async (req, res, next) => {
  const tutor = await Tutor.findOne({ userId: req.params.userId })
    .populate('userId', 'name email phone avatar bio createdAt');

  if (!tutor) {
    return next(new AppError('Tutor not found', 404));
  }

  res.status(200).json({
    success: true,
    data: tutor
  });
});

// @desc    Create tutor profile
// @route   POST /api/tutors
// @access  Private
export const createTutor = asyncHandler(async (req, res, next) => {
  const { university, major, year, teachingSubjects, hourlyRate, tutorBio, availability } = req.body;

  // Check if user already has a tutor profile
  const existingTutor = await Tutor.findOne({ userId: req.user._id });
  if (existingTutor) {
    return next(new AppError('Tutor profile already exists', 400));
  }

  // Update user role to tutor
  await User.findByIdAndUpdate(req.user._id, { role: 'tutor' });

  const tutor = await Tutor.create({
    userId: req.user._id,
    university,
    major,
    year,
    teachingSubjects,
    hourlyRate,
    tutorBio,
    availability
  });

  await tutor.populate('userId', 'name email phone avatar bio');

  res.status(201).json({
    success: true,
    message: 'Tutor profile created successfully',
    data: tutor
  });
});

// @desc    Update tutor profile
// @route   PUT /api/tutors/:id
// @access  Private
export const updateTutor = asyncHandler(async (req, res, next) => {
  let tutor = await Tutor.findById(req.params.id);

  if (!tutor) {
    return next(new AppError('Tutor not found', 404));
  }

  // Check if user owns this tutor profile or is admin
  if (tutor.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this tutor profile', 403));
  }

  const { university, major, year, teachingSubjects, hourlyRate, tutorBio, availability } = req.body;

  // Update fields
  if (university) tutor.university = university;
  if (major) tutor.major = major;
  if (year) tutor.year = year;
  if (teachingSubjects) tutor.teachingSubjects = teachingSubjects;
  if (hourlyRate) tutor.hourlyRate = hourlyRate;
  if (tutorBio !== undefined) tutor.tutorBio = tutorBio;
  if (availability) tutor.availability = availability;

  await tutor.save();
  await tutor.populate('userId', 'name email phone avatar bio');

  res.status(200).json({
    success: true,
    message: 'Tutor profile updated successfully',
    data: tutor
  });
});

// @desc    Delete tutor profile
// @route   DELETE /api/tutors/:id
// @access  Private/Admin
export const deleteTutor = asyncHandler(async (req, res, next) => {
  const tutor = await Tutor.findById(req.params.id);

  if (!tutor) {
    return next(new AppError('Tutor not found', 404));
  }

  // Update user role back to student
  await User.findByIdAndUpdate(tutor.userId, { role: 'student' });

  await tutor.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Tutor profile deleted successfully',
    data: {}
  });
});
