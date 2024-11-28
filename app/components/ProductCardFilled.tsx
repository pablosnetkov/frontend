'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { apiRequest } from './utils/api';
import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import QuantityControl from './QuantityControl';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

interface ProductCardFilledProps {
  product: Product;
}

interface BasketItem {
  id: number;
  good: number;
  quantity: number;
}

export default function ProductCardFilled({ product }: ProductCardFilledProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isInBasket, setIsInBasket] = useState(false);
  const [basketItemId, setBasketItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(0);
  const { showNotification } = useNotification();

  // Проверяем, есть ли товар в корзине
  const checkBasketStatus = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiRequest<{ results: BasketItem[] }>('/api/v1/me/basket-items/');
      const basketItem = response.results.find(item => item.good === product.id);
      if (basketItem) {
        setIsInBasket(true);
        setBasketItemId(basketItem.id);
        setQuantity(basketItem.quantity);
      }
    } catch (err) {
      console.error('Ошибка при проверке корзины:', err);
    }
  };

  useEffect(() => {
    checkBasketStatus();
  }, [isAuthenticated, product.id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    try {
      if (isInBasket && basketItemId) {
        // Обновляем количество
        await apiRequest(`/api/v1/me/basket-items/${basketItemId}/`, {
          method: 'PATCH',
          body: JSON.stringify({
            quantity: quantity + 1
          })
        });
        setQuantity(prev => prev + 1);
      } else {
        // Добавляем новый товар
        const response = await apiRequest<BasketItem>('/api/v1/me/basket-items/', {
          method: 'POST',
          body: JSON.stringify({
            good: product.id,
            quantity: 1
          })
        });
        setIsInBasket(true);
        setBasketItemId(response.id);
        setQuantity(1);
      }
      
      showNotification('Товар добавлен в корзину', 'success');
    } catch (err) {
      console.error('Ошибка при работе с корзиной:', err);
      showNotification('Произошла ошибка', 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
        <span className="text-gray-400 text-6xl">
          {product.name.charAt(0).toUpperCase()}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
      
      {product.description && (
        <p className="text-gray-600 mb-6">{product.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-gray-900">
          {product.price.toLocaleString()} ₽
        </span>
        <div className="flex items-center space-x-2">
          {isInBasket ? (
            <QuantityControl
              quantity={quantity}
              onIncrease={handleAddToCart}
              onDecrease={async () => {
                if (!basketItemId) return;
                try {
                  await apiRequest(`/api/v1/me/basket-items/${basketItemId}/`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                      quantity: quantity - 1
                    })
                  });
                  setQuantity(prev => prev - 1);
                } catch (err) {
                  console.error('Ошибка при изменении количества:', err);
                  showNotification('Ошибка при изменении количества', 'error');
                }
              }}
              isLoading={false}
            />
          ) : (
            <button 
              onClick={handleAddToCart}
              className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <span>🛒</span>
              В корзину
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

