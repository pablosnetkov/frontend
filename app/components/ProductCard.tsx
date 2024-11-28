'use client';

import Link from 'next/link';
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

interface ProductCardProps {
  product: Product;
}

interface BasketItem {
  id: number;
  good: number;
  quantity: number;
}

export default function ProductCard({ product }: ProductCardProps) {
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

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    try {
      if (isInBasket && basketItemId) {
        // Обновляем количество без уведомления
        await apiRequest(`/api/v1/me/basket-items/${basketItemId}/`, {
          method: 'PATCH',
          body: JSON.stringify({
            quantity: quantity + 1
          })
        });
        setQuantity(prev => prev + 1);
      } else {
        // Добавляем новый товар с уведомлением
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
        showNotification('Товар добавлен в корзину', 'success');
      }
    } catch (err) {
      console.error('Ошибка при работе с корзиной:', err);
      showNotification('Произошла ошибка', 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link href={`/product/${product.id}`}>
        <div className="cursor-pointer">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
              {product.name}
            </h3>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 flex justify-between items-center">
        <span className="text-2xl font-bold text-gray-900">
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
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
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