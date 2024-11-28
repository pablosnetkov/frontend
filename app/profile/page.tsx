'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { isAuthenticated, userEmail, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  if (loading) {
    return <div className="text-center mt-8">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Профиль</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Email</h2>
          <p className="text-gray-600">{userEmail}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
