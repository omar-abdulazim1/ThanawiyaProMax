// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  async login(email, password) {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.data));
      }

      return data;
    } catch (error) {
      return { success: false, message: error.message || 'حدث خطأ أثناء تسجيل الدخول' };
    }
  },

  async register(userData) {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.data));
      }

      return data;
    } catch (error) {
      return { success: false, message: error.message || 'حدث خطأ أثناء التسجيل' };
    }
  },

  async getMe() {
    try {
      const data = await apiRequest('/auth/me');
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async updatePassword(currentPassword, newPassword) {
    try {
      const data = await apiRequest('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  logout() {
    localStorage.removeItem('user');
  }
};

/**
 * Users API
 */
export const usersAPI = {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/users?${queryParams}` : '/users';
    return await apiRequest(endpoint);
  },

  async getById(id) {
    return await apiRequest(`/users/${id}`);
  },

  async update(id, updates) {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id) {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  async updateBalance(id, amount, operation) {
    return await apiRequest(`/users/${id}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ amount, operation }),
    });
  },

  async addFavorite(userId, tutorId) {
    return await apiRequest(`/users/${userId}/favorites/${tutorId}`, {
      method: 'POST',
    });
  },

  async removeFavorite(userId, tutorId) {
    return await apiRequest(`/users/${userId}/favorites/${tutorId}`, {
      method: 'DELETE',
    });
  }
};

/**
 * Tutors API
 */
export const tutorsAPI = {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/tutors?${queryParams}` : '/tutors';
    return await apiRequest(endpoint);
  },

  async getById(id) {
    return await apiRequest(`/tutors/${id}`);
  },

  async getByUserId(userId) {
    return await apiRequest(`/tutors/user/${userId}`);
  },

  async create(tutorData) {
    return await apiRequest('/tutors', {
      method: 'POST',
      body: JSON.stringify(tutorData),
    });
  },

  async update(id, updates) {
    return await apiRequest(`/tutors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id) {
    return await apiRequest(`/tutors/${id}`, {
      method: 'DELETE',
    });
  }
};

/**
 * Bookings API
 */
export const bookingsAPI = {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/bookings?${queryParams}` : '/bookings';
    return await apiRequest(endpoint);
  },

  async getById(id) {
    return await apiRequest(`/bookings/${id}`);
  },

  async create(bookingData) {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async update(id, updates) {
    return await apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id) {
    return await apiRequest(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  async cancel(id, reason) {
    return await apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled', cancellationReason: reason }),
    });
  },

  async confirm(id) {
    return await apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'confirmed' }),
    });
  },

  async complete(id) {
    return await apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
    });
  },

  async rate(id, rating, review) {
    return await apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, review }),
    });
  }
};

/**
 * Payments API
 */
export const paymentsAPI = {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/payments?${queryParams}` : '/payments';
    return await apiRequest(endpoint);
  },

  async getById(id) {
    return await apiRequest(`/payments/${id}`);
  },

  async create(paymentData) {
    return await apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async deposit(amount, method, description) {
    return await apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({
        type: 'deposit',
        amount,
        method,
        description: description || 'إيداع رصيد'
      }),
    });
  },

  async withdraw(amount, method, description) {
    return await apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({
        type: 'withdrawal',
        amount,
        method,
        description: description || 'سحب رصيد'
      }),
    });
  },

  async updateStatus(id, status) {
    return await apiRequest(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async delete(id) {
    return await apiRequest(`/payments/${id}`, {
      method: 'DELETE',
    });
  }
};

/**
 * Initialize data (for backward compatibility)
 */
export async function initializeData() {
  // No longer needed with real API, but keep for compatibility
  return true;
}

/**
 * Get data (for backward compatibility with old code)
 */
export async function getData(collection) {
  try {
    switch (collection) {
      case 'users':
        const usersResponse = await usersAPI.getAll();
        return usersResponse.data || [];
      case 'tutors':
        const tutorsResponse = await tutorsAPI.getAll();
        return tutorsResponse.data || [];
      case 'bookings':
        const bookingsResponse = await bookingsAPI.getAll();
        return bookingsResponse.data || [];
      case 'payments':
        const paymentsResponse = await paymentsAPI.getAll();
        return paymentsResponse.data || [];
      default:
        return [];
    }
  } catch (error) {
    console.error('Error getting data:', error);
    return [];
  }
}

export default {
  authAPI,
  usersAPI,
  tutorsAPI,
  bookingsAPI,
  paymentsAPI,
  initializeData,
  getData
};
