'use client';

import { useAuth } from '../hooks/useAuth';
import { auth } from '../utils/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiRequest } from '../components/utils/api';
import Link from 'next/link';
import { useNotification } from '../contexts/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';
import QuantityControl from '../components/QuantityControl';

interface BasketItem {
  id: number;
  good: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category: number;
}

interface BasketItemWithProduct extends BasketItem {
  productDetails?: Product;
}

interface BasketResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BasketItem[];
}

export default function BasketPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [basketItems, setBasketItems] = useState<BasketItemWithProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    itemId: number | null;
  }>({
    isOpen: false,
    itemId: null
  });

  const fetchProductDetails = async (goodId: number): Promise<Product> => {
    return await apiRequest<Product>(`/api/v1/goods/${goodId}/`);
  };

  const fetchBasketItems = async () => {
    try {
      console.log('Начало загрузки корзины');
      const data = await apiRequest<BasketResponse>('/api/v1/me/basket-items/');
      console.log('Ответ API корзины:', data);

      const itemsWithDetails = await Promise.all(
        data.results.map(async (item) => {
          try {
            const productDetails = await fetchProductDetails(item.good);
            return {
              ...item,
              productDetails
            };
          } catch (err) {
            console.error(`Ошибка загрузки товара ${item.good}:`, err);
            return {
              ...item,
              productDetails: undefined
            };
          }
        })
      );

      console.log('Товары с деталями:', itemsWithDetails);
      setBasketItems(itemsWithDetails);
    } catch (err) {
      console.error('Ошбка при загрузке корзины:', err);
      setError('Ошибка при загрузке корзины');
      if (err instanceof Error && err.message.includes('Сессия истекла')) {
        router.push('/auth');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (itemId: number) => {
    setConfirmDialog({
      isOpen: true,
      itemId
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.itemId === null) return;

    try {
      setIsLoading(true);
      await apiRequest(`/api/v1/me/basket-items/${confirmDialog.itemId}/`, {
        method: 'DELETE'
      });

      setBasketItems(prev => prev.filter(item => item.id !== confirmDialog.itemId));
      showNotification('Товар удален из корзины', 'success');
    } catch (err) {
      console.error('Ошибка при удалении товара:', err);
      setError('Ошибка при удалении товара');
      
      if (err instanceof Error && err.message.includes('Сессия истекла')) {
        router.push('/auth');
      }
    } finally {
      setIsLoading(false);
      setConfirmDialog({ isOpen: false, itemId: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, itemId: null });
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    try {
      await apiRequest(`/api/v1/me/basket-items/${itemId}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          quantity: newQuantity
        })
      });

      setBasketItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (err) {
      console.error('Ошибка при изменении количества:', err);
      showNotification('Ошибка при изменении количества', 'error');
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated) {
      fetchBasketItems();
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isLoading) {
    return <div className="text-center mt-8">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Корзина</h1>
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {basketItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Ваша корзина пуста</p>
          <Link 
            href="/categories"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Перейти к покупкам
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {basketItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-center w-full">
                <div>
                  <h3 className="text-lg font-medium mb-1">{item.productDetails?.name}</h3>
                  <p className="text-gray-600">
                    {item.productDetails?.price?.toLocaleString()} ₽
                  </p>
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
                    onClick={() => handleDeleteClick(item.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Удаление товара"
        message="Вы уверены, что хотите удалить этот товар из корзины?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
