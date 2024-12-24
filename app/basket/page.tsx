'use client';

import { useState, useEffect } from 'react';
import BasketItemList from '../components/BasketItemList';
import CheckoutForm from '../components/CheckoutForm';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../components/utils/api';

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
  good: number; // ID товара
  quantity: number;
}

interface BasketItemWithGood {
  id: number;
  good: Good;
  quantity: number;
}

interface ApiResponse<T> {
  results: T[];
}

export default function BasketPage() {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [basketItems, setBasketItems] = useState<BasketItemWithGood[]>([]);
  const router = useRouter();
  const { isAuthenticated, loading, token } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
      return;
    }

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
      }
    };

    fetchBasketItems();
  }, [token, isAuthenticated, loading, router]);

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Корзина</h1>
      <BasketItemList />
      
      {basketItems.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowCheckoutForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Оформить заказ
          </button>
        </div>
      )}
      
      {showCheckoutForm && basketItems.length > 0 && (
        <CheckoutForm
          basketItems={basketItems}
          onSuccess={() => {
            setShowCheckoutForm(false);
            window.location.reload();
          }}
          onCancel={() => setShowCheckoutForm(false)}
        />
      )}
    </div>
  );
}
