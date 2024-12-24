'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import AddProduct from './components/AddProduct';
import ProductManager from './components/ProductManager';
import AddCategory from './components/AddCategory';
import ProductList from './components/ProductList';
import PaymentMethodManager from './components/PaymentMethodManager';
import DeliveryMethodManager from './components/DeliveryMethodManager';
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
    <div className="container mx-auto p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 ${activeTab === 'products' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('products')}
        >
          Управление товарами
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('categories')}
        >
          Управление категориями
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'payment-methods' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('payment-methods')}
        >
          Способы оплаты
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'delivery-methods' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('delivery-methods')}
        >
          Способы доставки
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'checkouts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('checkouts')}
        >
          Заказы
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'add-product' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('add-product')}
        >
          Добавить товар
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'add-category' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('add-category')}
        >
          Добавить категорию
        </button>
      </div>

      {activeTab === 'products' && <ProductManager token={token} />}
      {activeTab === 'categories' && <ProductList token={token} />}
      {activeTab === 'payment-methods' && <PaymentMethodManager token={token} />}
      {activeTab === 'delivery-methods' && <DeliveryMethodManager token={token} />}
      {activeTab === 'checkouts' && <CheckoutManager token={token} />}
      {activeTab === 'add-product' && <AddProduct token={token} />}
      {activeTab === 'add-category' && <AddCategory token={token} />}
    </div>
  );
} 