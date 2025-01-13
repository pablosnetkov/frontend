'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from './utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import QuantityControl from './QuantityControl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Good {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: number;
}

interface BasketItem {
  id: number;
  good: number;
  quantity: number;
}

interface BasketItemWithGood {
  id: number;
  good: Good;
  quantity: number;
}

export default function BasketItemList() {
  const [basketItems, setBasketItems] = useState<BasketItemWithGood[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { token } = useAuth();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    const fetchBasketItems = async () => {
      if (!token) return;
      
      try {
        const basketResponse = await apiRequest<{ results: BasketItem[] }>('/api/v1/me/basket-items/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const itemsWithGoods = await Promise.all(
          basketResponse.results.map(async (item) => {
            const goodResponse = await apiRequest<Good>(`/api/v1/goods/${item.good}/`);
            return {
              id: item.id,
              good: goodResponse,
              quantity: item.quantity
            };
          })
        );

        setBasketItems(itemsWithGoods);
      } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
        showNotification('Ошибка при загрузке корзины', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBasketItems();
  }, [token, showNotification]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    try {
      await apiRequest(`/api/v1/me/basket-items/${itemId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      setBasketItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Ошибка при изменении количества:', error);
      showNotification('Ошибка при изменении количества', 'error');
    }
  };

  const handleDelete = async (itemId: number) => {
    setIsDeleting(itemId);
    try {
      await apiRequest(`/api/v1/me/basket-items/${itemId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setBasketItems(prev => prev.filter(item => item.id !== itemId));
      showNotification('Товар удален из корзины', 'success');
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      showNotification('Ошибка при удалении товара', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (basketItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-xl text-gray-500 mb-6">Ваша корзина пуста</p>
        <Link 
          href="/categories"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Перейти к покупкам
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {basketItems.map(item => (
        <div 
          key={item.id} 
          className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300
            ${isDeleting === item.id ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
        >
          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={item.good.image || '/placeholder.jpg'}
                  alt={item.good.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                  {item.good.name}
                </h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Цена за шт.: {item.good.price} ₽</div>
                  <div className="font-medium text-gray-900">
                    Сумма: {Number(item.good.price) * Number(item.quantity)} ₽
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isDeleting === item.id}
                  className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                  aria-label="Удалить товар"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <QuantityControl
                  quantity={item.quantity}
                  onIncrease={() => handleQuantityChange(item.id, item.quantity + 1)}
                  onDecrease={() => handleQuantityChange(item.id, item.quantity - 1)}
                  isLoading={false}
                  isBasket={true}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="sticky bottom-0 bg-white shadow-lg rounded-t-lg p-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            Всего товаров: {basketItems.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            Итого: {basketItems.reduce((sum, item) => {
              const price = Number(item.good.price) || 0;
              const quantity = Number(item.quantity) || 0;
              return sum + (price * quantity);
            }, 0).toFixed(2)} ₽
          </div>
        </div>
      </div>
    </div>
  );
} 