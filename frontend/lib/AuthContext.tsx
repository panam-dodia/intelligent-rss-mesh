'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, api } from './api';

interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check for existing token
    const savedToken = localStorage.getItem('access_token');
    console.log('Saved token on mount:', savedToken); // DEBUG
    
    if (savedToken) {
        // Don't manually set header - interceptor will handle it
        setToken(savedToken);
        fetchUser();
    } else {
        setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Clear invalid token
      localStorage.removeItem('access_token');
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { access_token, user: userData } = response.data;
    
    console.log('Login response:', { access_token, userData });
    
    localStorage.setItem('access_token', access_token);
    // Don't manually set header - interceptor will handle it
    setToken(access_token);
    setUser(userData);
    
    console.log('State updated:', { token: access_token, user: userData });
  };

  const register = async (email: string, username: string, password: string, fullName?: string) => {
    const response = await authAPI.register({ 
        email, 
        username, 
        password, 
        full_name: fullName 
    });
    const { access_token, user: userData } = response.data;
    
    console.log('Register response:', { access_token, userData });
    
    localStorage.setItem('access_token', access_token);
    // Don't manually set header - interceptor will handle it
    setToken(access_token);
    setUser(userData);
    
    console.log('State updated:', { token: access_token, user: userData });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    // Don't need to remove from axios - interceptor handles it
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}