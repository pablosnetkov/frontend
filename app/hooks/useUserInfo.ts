'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../components/utils/api';
import { useAuth } from './useAuth';

interface UserInfo {
  email: string;
  staff: boolean;
}

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isAuthenticated || !token) {
        setUserInfo(null);
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<UserInfo>('/api/v1/auth/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUserInfo(response);
      } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token, isAuthenticated]);

  const refreshUserInfo = async () => {
    setLoading(true);
    if (token) {
      try {
        const response = await apiRequest<UserInfo>('/api/v1/auth/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUserInfo(response);
      } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    }
  };

  return { userInfo, loading, refreshUserInfo };
} 