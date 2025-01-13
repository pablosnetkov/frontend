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
  image?: string;
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
        await apiRequest(`/api/v1/me/basket-items/${basketItemId}/`, {
          method: 'PATCH',
          body: JSON.stringify({
            quantity: quantity + 1
          })
        });
        setQuantity(prev => prev + 1);
      } else {
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="md:flex">
        {/* Изображение */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="aspect-square">
            <img 
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            {/* Верхняя часть с названием и ценой */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
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
                      className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <span>🛒</span>
                      В корзину
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Разделитель */}
            <hr className="border-gray-200 my-6" />

            {/* Описание */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Описание
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

