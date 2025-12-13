/**
 * API Service for ThanawiyaPro Backend Integration
 * Connects frontend to Express.js REST API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
const TOKEN_KEY = 'thanawiyapro_token';
const USER_KEY = 'thanawiyapro_user';

/**
 * Get stored auth token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Save auth token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove auth token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Save user data
 */
export const setStoredUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Remove user data
 */
export const removeStoredUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Make API request with automatic token inclusion
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add auth token if available
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'حدث خطأ في الاتصال بالخادم');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ==================== Authentication API ====================

/**
 * Login user
 */
export const login = async (email, password) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.success && data.data.token) {
    setToken(data.data.token);
    setStoredUser(data.data.user);
  }

  return data;
};

/**
 * Register new user (student or tutor)
 */
export const register = async (userData) => {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (data.success && data.data.token) {
    setToken(data.data.token);
    setStoredUser(data.data.user);
  }

  return data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const data = await apiRequest('/auth/me');
  
  if (data.success && data.data) {
    setStoredUser(data.data);
  }
  
  return data;
};

/**
 * Update user password
 */
export const updatePassword = async (oldPassword, newPassword) => {
  return await apiRequest('/auth/update-password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
};

/**
 * Logout user
 */
export const logout = () => {
  removeToken();
  removeStoredUser();
};

// ==================== Users API ====================

/**
 * Get all users (admin only)
 */
export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  return await apiRequest(`/users?${params}`);
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  return await apiRequest(`/users/${userId}`);
};

/**
 * Update user profile
 */
export const updateUser = async (userId, userData) => {
  return await apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

/**
 * Update user balance
 */
export const updateBalance = async (userId, amount, operation) => {
  return await apiRequest(`/users/${userId}/balance`, {
    method: 'PUT',
    body: JSON.stringify({ amount, operation }),
  });
};

/**
 * Add tutor to favorites
 */
export const addFavorite = async (userId, tutorId) => {
  return await apiRequest(`/users/${userId}/favorites/${tutorId}`, {
    method: 'POST',
  });
};

/**
 * Remove tutor from favorites
 */
export const removeFavorite = async (userId, tutorId) => {
  return await apiRequest(`/users/${userId}/favorites/${tutorId}`, {
    method: 'DELETE',
  });
};

// ==================== Tutors API ====================

/**
 * Get all tutors with optional filters
 */
export const getTutors = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.subjects) params.append('subjects', filters.subjects);
  if (filters.minRate) params.append('minRate', filters.minRate);
  if (filters.maxRate) params.append('maxRate', filters.maxRate);
  if (filters.minRating) params.append('minRating', filters.minRating);
  if (filters.university) params.append('university', filters.university);
  if (filters.year) params.append('year', filters.year);
  
  return await apiRequest(`/tutors?${params}`);
};

/**
 * Get tutor by ID
 */
export const getTutorById = async (tutorId) => {
  return await apiRequest(`/tutors/${tutorId}`);
};

/**
 * Get tutor by user ID
 */
export const getTutorByUserId = async (userId) => {
  return await apiRequest(`/tutors/user/${userId}`);
};

/**
 * Update tutor profile
 */
export const updateTutor = async (tutorId, tutorData) => {
  return await apiRequest(`/tutors/${tutorId}`, {
    method: 'PUT',
    body: JSON.stringify(tutorData),
  });
};

// ==================== Bookings API ====================

/**
 * Create new booking
 */
export const createBooking = async (bookingData) => {
  return await apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};

/**
 * Get all bookings (filtered by user role)
 */
export const getBookings = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  return await apiRequest(`/bookings?${params}`);
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId) => {
  return await apiRequest(`/bookings/${bookingId}`);
};

/**
 * Update booking status
 */
export const updateBooking = async (bookingId, updateData) => {
  return await apiRequest(`/bookings/${bookingId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

/**
 * Confirm booking
 */
export const confirmBooking = async (bookingId) => {
  return await updateBooking(bookingId, { status: 'confirmed' });
};

/**
 * Cancel booking
 */
export const cancelBooking = async (bookingId, reason) => {
  return await updateBooking(bookingId, { status: 'cancelled', reason });
};

/**
 * Complete booking
 */
export const completeBooking = async (bookingId) => {
  return await updateBooking(bookingId, { status: 'completed' });
};

/**
 * Rate booking
 */
export const rateBooking = async (bookingId, rating, review) => {
  return await updateBooking(bookingId, { rating, review });
};

// ==================== Payments API ====================

/**
 * Create payment (deposit or withdrawal)
 */
export const createPayment = async (paymentData) => {
  return await apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

/**
 * Get all payments (filtered by user)
 */
export const getPayments = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  return await apiRequest(`/payments?${params}`);
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId) => {
  return await apiRequest(`/payments/${paymentId}`);
};

/**
 * Update payment status (admin only)
 */
export const updatePaymentStatus = async (paymentId, status) => {
  return await apiRequest(`/payments/${paymentId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

/**
 * Deposit money to account
 */
export const deposit = async (amount, paymentMethod) => {
  return await createPayment({
    type: 'deposit',
    amount,
    paymentMethod,
  });
};

/**
 * Withdraw money from account
 */
export const withdraw = async (amount, paymentMethod) => {
  return await createPayment({
    type: 'withdrawal',
    amount,
    paymentMethod,
  });
};

// ==================== Helper Functions ====================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get user role
 */
export const getUserRole = () => {
  const user = getStoredUser();
  return user?.role || null;
};

/**
 * Format error message in Arabic
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'حدث خطأ غير متوقع';
};

// Export all functions as default
export default {
  // Auth
  login,
  register,
  getCurrentUser,
  updatePassword,
  logout,
  
  // Users
  getUsers,
  getUserById,
  updateUser,
  updateBalance,
  addFavorite,
  removeFavorite,
  
  // Tutors
  getTutors,
  getTutorById,
  getTutorByUserId,
  updateTutor,
  
  // Bookings
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
  rateBooking,
  
  // Payments
  createPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
  deposit,
  withdraw,
  
  // Helpers
  isAuthenticated,
  getUserRole,
  formatErrorMessage,
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
};
