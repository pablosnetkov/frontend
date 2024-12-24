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
    if (!window.confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
      return;
    }

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
    }
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  if (basketItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Ваша корзина пуста</p>
        <Link 
          href="/categories"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Перейти к покупкам
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {basketItems.map(item => (
        <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-1">{item.good.name}</h3>
              <div className="text-gray-600 mb-2">
                <div>Цена за шт.: {item.good.price} ₽</div>
                <div>Количество: {item.quantity} шт.</div>
                <div className="font-semibold">
                  Сумма: {Number(item.good.price) * Number(item.quantity)} ₽
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <QuantityControl
                quantity={item.quantity}
                onIncrease={() => handleQuantityChange(item.id, item.quantity + 1)}
                onDecrease={() => handleQuantityChange(item.id, item.quantity - 1)}
                isLoading={false}
                isBasket={true}
              />
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="text-right text-xl font-bold mt-4">
        Итого: {basketItems.reduce((sum, item) => {
          const price = Number(item.good.price) || 0;
          const quantity = Number(item.quantity) || 0;
          return sum + (price * quantity);
        }, 0).toFixed(2)} ₽
      </div>
    </div>
  );
} 