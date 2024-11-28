'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../components/utils/api';
import { auth } from '../utils/auth';
import { useRouter } from 'next/navigation';

interface LoginResponse {
  message: string;
}

interface VerifyResponse {
  access: string;
  refresh: string;
}

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    
    const requestData = {
      email: cleanEmail
    };

    console.log('=== Начало отправки email ===');
    console.log('Подготовленные данные:', requestData);

    try {
      console.log('Отправка запроса...');
      const response = await apiRequest<LoginResponse>('/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Успешный ответ:', response);
      setStep(2);
      setError(null);
    } catch (err: any) {
      console.error('=== Ошибка при отправке email ===');
      console.error('Тип ошибки:', err.constructor.name);
      console.error('Сообщение ошибки:', err.message);
      console.error('Полная ошибка:', err);

      let errorMessage = 'Ошибка при отправке email';
      try {
        const errorData = JSON.parse(err.message);
        console.log('Распарсенные данные ошибки:', errorData);
        if (errorData.email && Array.isArray(errorData.email)) {
          errorMessage = errorData.email[0];
        }
      } catch (parseError) {
        console.error('Ошибка при парсинге ошибки:', parseError);
      }
      
      setError(errorMessage);
    } finally {
      console.log('=== Завершение отправки email ===');
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const requestData = {
      email: cleanEmail,
      otp: cleanCode
    };

    console.log('=== Начало подтверждения кода ===');
    console.log('Подготовленные данные:', requestData);

    try {
      console.log('Отправка запроса подтверждения...');
      const response = await apiRequest<VerifyResponse>('/api/v1/auth/confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Успешный ответ при подтверждении:', response);
      auth.setToken(response.access);
      auth.setRefreshToken(response.refresh);
      localStorage.setItem('userEmail', cleanEmail);
      
      router.push('/');
    } catch (err: any) {
      console.error('=== Ошибка при подтверждении кода ===');
      console.error('Тип ошибки:', err.constructor.name);
      console.error('Сообщение ошибки:', err.message);
      console.error('Полная ошибка:', err);

      let errorMessage = 'Неверный код подтверждения';
      try {
        const errorData = JSON.parse(err.message);
        console.log('Распарсенные данные ошибки:', errorData);
        if (errorData.otp && Array.isArray(errorData.otp)) {
          errorMessage = errorData.otp[0];
        } else if (errorData.email && Array.isArray(errorData.email)) {
          errorMessage = errorData.email[0];
        }
      } catch (parseError) {
        console.error('Ошибка при парсинге ошибки:', parseError);
      }
      
      setError(errorMessage);
    } finally {
      console.log('=== Завершение подтверждения кода ===');
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = auth.getToken();
    if (token) {
      router.push('/profile');
    }
  }, [router]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">
        {step === 1 ? 'Вход в аккаунт' : 'Подтверждение email'}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Введите ваш email"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-gray-900 text-white rounded-md 
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'} 
              transition-colors`}
          >
            {loading ? 'Отправка...' : 'Получить код'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-gray-700 mb-2">
              Код подтверждения
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Введите код из email"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-gray-900 text-white rounded-md 
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'} 
              transition-colors`}
          >
            {loading ? 'Проверка...' : 'Войти'}
          </button>
        </form>
      )}

      {step === 2 && (
        <p className="mt-4 text-sm text-gray-600 text-center">
          Код подтверждения отправлен на {email}
        </p>
      )}
    </div>
  );
} 