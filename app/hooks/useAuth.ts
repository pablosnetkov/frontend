'use client';

import { useState, useEffect } from 'react';
import { auth } from '../utils/auth';
import { useRouter } from 'next/navigation';

interface UserData {
  email: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const checkAuth = async () => {
    const currentToken = auth.getToken();
    const email = localStorage.getItem('userEmail');

    if (!currentToken || !email) {
      setIsAuthenticated(false);
      setUserEmail(null);
      setToken(null);
      setLoading(false);
      return false;
    }

    try {
      setUserEmail(email);
      setToken(currentToken);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      auth.removeTokens();
      localStorage.removeItem('userEmail');
      setIsAuthenticated(false);
      setUserEmail(null);
      setToken(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Ошибка авторизации');
      }

      const data = await response.json();
      const newToken = data.access;
      
      auth.setToken(newToken);
      localStorage.setItem('userEmail', email);
      
      setToken(newToken);
      setIsAuthenticated(true);
      setUserEmail(email);
      
      return true;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      auth.removeTokens();
      localStorage.removeItem('userEmail');
      setIsAuthenticated(false);
      setUserEmail(null);
      setToken(null);
      router.push('/auth');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return { 
    isAuthenticated, 
    userEmail, 
    loading, 
    token,
    login,
    logout, 
    checkAuth 
  };
} 