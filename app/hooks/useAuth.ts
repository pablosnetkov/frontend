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
  const router = useRouter();

  const checkAuth = async () => {
    const token = auth.getToken();
    const email = localStorage.getItem('userEmail');

    if (!token || !email) {
      setIsAuthenticated(false);
      setUserEmail(null);
      setLoading(false);
      return false;
    }

    try {
      setUserEmail(email);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      auth.removeTokens();
      localStorage.removeItem('userEmail');
      setIsAuthenticated(false);
      setUserEmail(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await auth.logout();
      localStorage.removeItem('userEmail');
      setIsAuthenticated(false);
      setUserEmail(null);
      router.push('/auth');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return { isAuthenticated, userEmail, loading, logout, checkAuth };
} 