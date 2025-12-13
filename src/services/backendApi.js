// Backend API Service for ThanawiyaPro
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

// Helper function to make authenticated requests
const authenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  return handleResponse(response);
};

// ==================== AUTH API ====================

export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse(response);
    
    // Store user data and token
    if (data.success && data.data) {
      localStorage.setItem('user', JSON.stringify({
        ...data.data.user,
        token: data.data.token
      }));
    }
    
    return data;
  },
  
  // Register Student
  registerStudent: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, role: 'student' }),
    });
    
    const data = await handleResponse(response);
    
    // Store user data and token
    if (data.success && data.data) {
      localStorage.setItem('user', JSON.stringify({
        ...data.data.user,
        token: data.data.token
      }));
    }
    
    return data;
  },
  
  // Register Tutor
  registerTutor: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, role: 'tutor' }),
    });
    
    const data = await handleResponse(response);
    
    // Store user data and token
    if (data.success && data.data) {
      localStorage.setItem('user', JSON.stringify({
        ...data.data.user,
        token: data.data.token
      }));
    }
    
    return data;
  },
  
  // Get current user
  getCurrentUser: async () => {
    return authenticatedRequest('/auth/me');
  },
  
  // Update password
  updatePassword: async (oldPassword, newPassword) => {
    return authenticatedRequest('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('user');
  },
};

// ==================== USER API ====================

export const userAPI = {
  // Get all users (admin only)
  getAllUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.search) queryParams.append('search', filters.search);
    
    const queryString = queryParams.toString();
    return authenticatedRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    return authenticatedRequest(`/users/${userId}`);
  },
  
  // Update user profile
  updateUser: async (userId, userData) => {
    return authenticatedRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  // Update balance
  updateBalance: async (userId, amount, operation) => {
    return authenticatedRequest(`/users/${userId}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ amount, operation }),
    });
  },
  
  // Add to favorites
  addFavorite: async (userId, tutorId) => {
    return authenticatedRequest(`/users/${userId}/favorites/${tutorId}`, {
      method: 'POST',
    });
  },
  
  // Remove from favorites
  removeFavorite: async (userId, tutorId) => {
    return authenticatedRequest(`/users/${userId}/favorites/${tutorId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== TUTOR API ====================

export const tutorAPI = {
  // Get all tutors with filters
  getAllTutors: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.subjects) queryParams.append('subjects', filters.subjects);
    if (filters.minRate) queryParams.append('minRate', filters.minRate);
    if (filters.maxRate) queryParams.append('maxRate', filters.maxRate);
    if (filters.minRating) queryParams.append('minRating', filters.minRating);
    
    const queryString = queryParams.toString();
    return authenticatedRequest(`/tutors${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get tutor by ID
  getTutorById: async (tutorId) => {
    return authenticatedRequest(`/tutors/${tutorId}`);
  },
  
  // Get tutor by user ID
  getTutorByUserId: async (userId) => {
    return authenticatedRequest(`/tutors/user/${userId}`);
  },
  
  // Update tutor profile
  updateTutor: async (tutorId, tutorData) => {
    return authenticatedRequest(`/tutors/${tutorId}`, {
      method: 'PUT',
      body: JSON.stringify(tutorData),
    });
  },
};

// ==================== BOOKING API ====================

export const bookingAPI = {
  // Create booking
  createBooking: async (bookingData) => {
    return authenticatedRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },
  
  // Get all bookings (filtered by user role automatically)
  getAllBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    
    const queryString = queryParams.toString();
    return authenticatedRequest(`/bookings${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get booking by ID
  getBookingById: async (bookingId) => {
    return authenticatedRequest(`/bookings/${bookingId}`);
  },
  
  // Update booking (confirm, cancel, complete, rate)
  updateBooking: async (bookingId, updateData) => {
    return authenticatedRequest(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },
  
  // Confirm booking
  confirmBooking: async (bookingId) => {
    return authenticatedRequest(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'confirmed' }),
    });
  },
  
  // Cancel booking
  cancelBooking: async (bookingId) => {
    return authenticatedRequest(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' }),
    });
  },
  
  // Complete booking
  completeBooking: async (bookingId) => {
    return authenticatedRequest(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
    });
  },
  
  // Rate booking
  rateBooking: async (bookingId, rating, review = '') => {
    return authenticatedRequest(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, review }),
    });
  },
};

// ==================== PAYMENT API ====================

export const paymentAPI = {
  // Create payment (deposit/withdrawal)
  createPayment: async (paymentData) => {
    return authenticatedRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
  
  // Deposit
  deposit: async (amount, paymentMethod) => {
    return authenticatedRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({
        type: 'deposit',
        amount,
        paymentMethod,
      }),
    });
  },
  
  // Withdrawal
  withdrawal: async (amount, paymentMethod) => {
    return authenticatedRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({
        type: 'withdrawal',
        amount,
        paymentMethod,
      }),
    });
  },
  
  // Get all payments
  getAllPayments: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);
    
    const queryString = queryParams.toString();
    return authenticatedRequest(`/payments${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get payment by ID
  getPaymentById: async (paymentId) => {
    return authenticatedRequest(`/payments/${paymentId}`);
  },
  
  // Update payment status (admin only)
  updatePaymentStatus: async (paymentId, status) => {
    return authenticatedRequest(`/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  
  // Approve payment (admin only)
  approvePayment: async (paymentId) => {
    return authenticatedRequest(`/payments/${paymentId}/approve`, {
      method: 'PUT',
    });
  },
  
  // Reject payment (admin only)
  rejectPayment: async (paymentId, reason) => {
    return authenticatedRequest(`/payments/${paymentId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },
};

// ==================== UTILITY FUNCTIONS ====================

export const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  return !!user;
};

export const getCurrentUserData = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getUserRole = () => {
  const user = getCurrentUserData();
  return user?.role || null;
};

// Export all APIs
export default {
  auth: authAPI,
  user: userAPI,
  tutor: tutorAPI,
  booking: bookingAPI,
  payment: paymentAPI,
  isAuthenticated,
  getCurrentUserData,
  getUserRole,
};
