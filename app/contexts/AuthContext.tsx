'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../components/utils/api';

interface UserInfo {
  email: string;
  staff: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  userInfo: UserInfo | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  loading: true,
  userInfo: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();

  const fetchUserInfo = async (authToken: string) => {
    try {
      const info = await apiRequest<UserInfo>('/api/v1/auth/info', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      setUserInfo(info);
    } catch (error) {
      console.error('Ошибка при получении информации о пользователе:', error);
      setUserInfo(null);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserInfo(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    await fetchUserInfo(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserInfo(null);
    router.push('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        loading,
        userInfo,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 