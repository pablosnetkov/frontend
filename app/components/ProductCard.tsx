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
  image?: string;
  discount?: number;
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
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden rounded-t-xl relative">
          <img 
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
          />
          {(product.discount ?? 0) > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
              -{product.discount}%
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              {(product.discount ?? 0) > 0 ? (
                <>
                  <span className="text-2xl font-bold text-gray-900">
                    {(product.price * (1 - (product.discount ?? 0) / 100)).toFixed(0)} ₽
                  </span>
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    {product.price.toLocaleString()} ₽
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  {product.price.toLocaleString()} ₽
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        {isInBasket ? (
          <div className="flex items-center justify-between">
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
          </div>
        ) : (
          <button 
            onClick={handleAddToCart}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            В корзину
          </button>
        )}
      </div>
    </div>
  );
}