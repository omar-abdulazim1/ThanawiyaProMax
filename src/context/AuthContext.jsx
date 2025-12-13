import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getCurrentUserData } from '../services/backendApi';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user and token on mount
    const initAuth = async () => {
      const storedUser = getCurrentUserData();
      
      if (storedUser && storedUser.token) {
        try {
          // Verify token is still valid by fetching current user
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            // Update stored user with fresh data
            const updatedUser = { ...response.data, token: storedUser.token };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          } else {
            // Token invalid, clear storage
            authAPI.logout();
            setUser(null);
          }
        } catch (error) {
          // Token invalid or expired
          console.error('Auth verification failed:', error);
          authAPI.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const userData = { ...response.data.user, token: response.data.token };
        setUser(userData);
        toast.success('تم تسجيل الدخول بنجاح');
        return { success: true, user: userData };
      }
      
      return { success: false, message: response.message || 'بيانات الدخول غير صحيحة' };
    } catch (error) {
      const message = error.message || 'فشل تسجيل الدخول';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const isStudent = userData.role === 'student' || !userData.university;
      const response = isStudent 
        ? await authAPI.registerStudent(userData)
        : await authAPI.registerTutor(userData);
      
      if (response.success) {
        const newUser = { ...response.data.user, token: response.data.token };
        setUser(newUser);
        toast.success('تم إنشاء الحساب بنجاح');
        return { success: true, user: newUser };
      }
      
      return { success: false, message: response.message || 'فشل إنشاء الحساب' };
    } catch (error) {
      const message = error.message || 'فشل إنشاء الحساب';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    toast.info('تم تسجيل الخروج بنجاح');
  };

  const updateUserProfile = async (userId, userData) => {
    try {
      const { userAPI } = await import('../services/backendApi');
      const response = await userAPI.updateUser(userId, userData);
      
      if (response.success) {
        const updatedUser = { ...response.data, token: user.token };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success('تم تحديث الملف الشخصي بنجاح');
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      const message = error.message || 'فشل تحديث الملف الشخصي';
      toast.error(message);
      return { success: false, message };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        const updatedUser = { ...response.data, token: user.token };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUserProfile,
    refreshUser,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
