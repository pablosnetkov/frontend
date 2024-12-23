'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import AddProduct from './components/AddProduct';
import ProductManager from './components/ProductManager';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, loading, token } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'manage' | 'add'>('manage');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
      showNotification('Необходима авторизация', 'error');
    }
  }, [isAuthenticated, loading, router, showNotification]);

  const handleManageClick = () => {
    setActiveTab('manage');
    router.push('/admin');
  };

  if (loading) {
    return <div className="text-center mt-8">Загрузка...</div>;
  }

  if (!isAuthenticated || !token) {
    return null;
  }

  return (
    <div>
      <div className="border-b mb-6">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={handleManageClick}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Управление товарами
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'add'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Добавить товар
            </button>
          </div>
        </nav>
      </div>

      {activeTab === 'manage' ? (
        <ProductManager token={token} />
      ) : (
        <AddProduct token={token} />
      )}
    </div>
  );
} 