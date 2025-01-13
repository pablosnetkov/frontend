'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import ProductManager from './components/ProductManager';
import DeliveryMethodManager from './components/DeliveryMethodManager';
import PaymentMethodManager from './components/PaymentMethodManager';
import CheckoutManager from './components/CheckoutManager';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, loading, token } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
      showNotification('Необходима авторизация', 'error');
    }
  }, [isAuthenticated, loading, router, showNotification]);

  if (loading) {
    return <div className="text-center mt-8">Загрузка...</div>;
  }

  if (!isAuthenticated || !token) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>
      
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'products'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Управление товарами
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'delivery'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Способы доставки
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'payment'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Способы оплаты
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Заказы
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'products' && <ProductManager token={token} />}
        {activeTab === 'delivery' && <DeliveryMethodManager token={token} />}
        {activeTab === 'payment' && <PaymentMethodManager token={token} />}
        {activeTab === 'orders' && <CheckoutManager token={token} />}
      </div>
    </div>
  );
} 