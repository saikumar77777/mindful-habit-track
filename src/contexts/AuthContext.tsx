
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getItem, setItem, removeItem } from '@/lib/local-storage';

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Mock API functions (replace with actual API calls)
const mockLogin = async (email: string, password: string): Promise<{ user: User, token: string, refreshToken: string }> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  // For demo purposes, create a mock user
  const user = {
    id: '1',
    email,
    name: email.split('@')[0],
    createdAt: new Date().toISOString()
  };
  
  return {
    user,
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token'
  };
};

const mockSignup = async (email: string, password: string, name?: string): Promise<{ user: User, token: string, refreshToken: string }> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  // For demo purposes, create a mock user
  const user = {
    id: '1',
    email,
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString()
  };
  
  return {
    user,
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token'
  };
};

const mockResetPassword = async (email: string): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate validation
  if (!email) {
    throw new Error('Email is required');
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = getItem<User | null>('user', null);
    const token = getItem<string | null>('auth_token', null);
    
    if (storedUser && token) {
      setUser(storedUser);
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user, token, refreshToken } = await mockLogin(email, password);
      
      // Save to localStorage
      setItem('user', user);
      setItem('auth_token', token);
      setItem('refresh_token', refreshToken);
      
      setUser(user);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Login failed: ${error instanceof Error ? error.message : 'An error occurred'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      const { user, token, refreshToken } = await mockSignup(email, password, name);
      
      // Save to localStorage
      setItem('user', user);
      setItem('auth_token', token);
      setItem('refresh_token', refreshToken);
      
      setUser(user);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Signup failed: ${error instanceof Error ? error.message : 'An error occurred'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    removeItem('user');
    removeItem('auth_token');
    removeItem('refresh_token');
    setUser(null);
    toast.info('Logged out successfully');
    navigate('/login');
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await mockResetPassword(email);
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error(`Password reset failed: ${error instanceof Error ? error.message : 'An error occurred'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...data } as User;
      setItem('user', updatedUser);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(`Profile update failed: ${error instanceof Error ? error.message : 'An error occurred'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
