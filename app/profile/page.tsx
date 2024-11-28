'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { isAuthenticated, userEmail, loading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.push('/auth');
      }
    };
    verify();
  }, [checkAuth, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated || !userEmail) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Email</h2>
          <p className="text-gray-600">{userEmail}</p>
        </div>

        {/* Здесь можно добавить дополнительные секции профиля */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Настройки</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Уведомления</span>
              <button className="text-blue-600 hover:text-blue-700">
                Настроить
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Безопасность</span>
              <button className="text-blue-600 hover:text-blue-700">
                Изменить
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">История заказов</h2>
          <div className="text-gray-500 text-center py-4">
            У вас пока нет заказов
          </div>
        </div>
      </div>
    </div>
  );
}
