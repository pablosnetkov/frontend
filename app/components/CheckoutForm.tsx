'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from './utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';

interface BasketItemWithGood {
  id: number;
  good: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: number;
  };
  quantity: number;
}

interface PaymentMethod {
  id: number;
  title: string;
  description: string;
}

interface DeliveryMethod {
  id: number;
  title: string;
  description: string;
}

interface CheckoutFormProps {
  basketItems: BasketItemWithGood[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface RecipientData {
  first_name: string;
  last_name: string;
  middle_name: string;
  phone: string;
  email: string;
  address: string;
  zip_code: string;
}

interface ApiResponse<T> {
  results: T[];
}

interface RecipientResponse {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  phone: string;
  email: string;
  address: string;
  zip_code: string;
}

interface UserData {
  id: number;
  email: string;
  // другие поля пользователя
}

interface CheckoutData {
  payment_total: number;
  payment_method: number;
  delivery_method: number;
  recipient: number;
  basket: number;
}

interface BasketResponse {
  id: number;
  items: BasketItemWithGood[];
}

export default function CheckoutForm({ basketItems, onSuccess, onCancel }: CheckoutFormProps) {
  const { showNotification } = useNotification();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('');
  const [recipientData, setRecipientData] = useState<RecipientData>({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone: '',
    email: '',
    address: '',
    zip_code: ''
  });
  const [basketId, setBasketId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const [paymentResponse, deliveryResponse] = await Promise.all([
          apiRequest<ApiResponse<PaymentMethod>>('/api/v1/payment-methods/', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiRequest<ApiResponse<DeliveryMethod>>('/api/v1/delivery-methods/', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        setPaymentMethods(paymentResponse.results || []);
        setDeliveryMethods(deliveryResponse.results || []);
      } catch (error) {
        console.error('Ошибка при загрузке методов:', error);
        showNotification('Ошибка при загрузке методов оплаты и доставки', 'error');
      }
    };

    if (token) {
      fetchMethods();
    }
  }, [token, showNotification]);

  useEffect(() => {
    const fetchBasketId = async () => {
      if (!token) return;
      
      try {
        const response = await apiRequest<BasketResponse>('/api/v1/me/basket/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setBasketId(response.id);
      } catch (error) {
        console.error('Ошибка при получении ID корзины:', error);
        showNotification('Ошибка при получении данных корзины', 'error');
      }
    };

    fetchBasketId();
  }, [token, showNotification]);

  const totalAmount = basketItems.reduce((sum, item) => {
    const price = Number(item.good.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  const clearBasket = async () => {
    try {
      // Удаляем все товары из корзины последовательно
      await Promise.all(
        basketItems.map(item => 
          apiRequest(`/api/v1/me/basket-items/${item.id}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
    } catch (error) {
      console.error('Ошибка при очистке корзины:', error);
      showNotification('Ошибка при очистке корзины', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showNotification('Необходима авторизация', 'error');
      return;
    }

    if (!basketId) {
      showNotification('Ошибка получения данных корзины', 'error');
      return;
    }

    if (basketItems.length === 0) {
      showNotification('Корзина пуста', 'error');
      return;
    }

    setLoading(true);

    try {
      // Создаем получателя
      const recipientResponse = await apiRequest<RecipientResponse>('/api/v1/recipients/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipientData)
      });

      // Создаем заказ с ID корзины
      const checkoutData: CheckoutData = {
        payment_total: totalAmount,
        payment_method: Number(selectedPaymentMethod),
        delivery_method: Number(selectedDeliveryMethod),
        recipient: recipientResponse.id,
        basket: basketId
      };

      await apiRequest('/api/v1/checkouts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      });

      // После успешного создания заказа очищаем корзину
      await clearBasket();

      showNotification('Заказ успешно оформлен', 'success');
      onSuccess();
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      showNotification('Ошибка при оформлении заказа', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Оформление заказа</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Товары в заказе:</h3>
          {basketItems.map(item => (
            <div key={item.id} className="flex justify-between items-start mb-4 border-b pb-2">
              <div className="flex-1">
                <div className="font-medium">{item.good.name}</div>
                <div className="text-sm text-gray-600">
                  Цена: {item.good.price} ₽ × {item.quantity} шт.
                </div>
              </div>
              <div className="font-semibold ml-4">
                {Number(item.good.price) * Number(item.quantity)} ₽
              </div>
            </div>
          ))}
          <div className="text-xl font-bold mt-4 text-right">
            Итого: {totalAmount.toFixed(2)} ₽
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Способ оплаты
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Выберите способ оплаты</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Способ доставки
            </label>
            <select
              value={selectedDeliveryMethod}
              onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Выберите способ доставки</option>
              {deliveryMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя
            </label>
            <input
              type="text"
              value={recipientData.first_name}
              onChange={(e) => setRecipientData({ ...recipientData, first_name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Фамилия
            </label>
            <input
              type="text"
              value={recipientData.last_name}
              onChange={(e) => setRecipientData({ ...recipientData, last_name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Отчество
            </label>
            <input
              type="text"
              value={recipientData.middle_name}
              onChange={(e) => setRecipientData({ ...recipientData, middle_name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Индекс
            </label>
            <input
              type="text"
              value={recipientData.zip_code}
              onChange={(e) => setRecipientData({ ...recipientData, zip_code: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={recipientData.phone}
              onChange={(e) => setRecipientData({ ...recipientData, phone: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={recipientData.email}
              onChange={(e) => setRecipientData({ ...recipientData, email: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Адрес доставки
            </label>
            <textarea
              value={recipientData.address}
              onChange={(e) => setRecipientData({ ...recipientData, address: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-blue-500 text-white rounded-md 
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            >
              {loading ? 'Оформление...' : 'Оформить заказ'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 